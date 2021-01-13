{-# LANGUAGE OverloadedStrings #-}

module Lib
    ( runBot
    ) where

import qualified Discord as D
import qualified Discord.Types as D
import qualified Discord.Requests as D
import qualified Data.Text as T
import qualified Data.Text.IO as TIO
import qualified Data.Map as Map
import qualified Control.Monad.Reader as Reader
import           Data.IORef (newIORef, readIORef, writeIORef, modifyIORef, IORef)
import           System.IO (hPutStrLn, stderr)
import           System.Environment (lookupEnv)
import           Control.Monad (when, void)
import           Control.Monad.Trans (liftIO)

data CritType = CritSuccess | CritFailure deriving (Eq)
data BotState = BotState {
      successes :: Map.Map D.UserId Int
    , failures  :: Map.Map D.UserId Int
    }

runBot :: IO ()
runBot = do
    stateRef <- newIORef $ BotState {successes = Map.empty, failures = Map.empty}
    tokenM <- lookupEnv "DISCORD_TOKEN"
    case tokenM of
        Nothing ->
            hPutStrLn stderr "Expected environment variable DISCORD_TOKEN"
        Just token -> do
            putStrLn "Starting bot..."
            userFacingError <- D.runDiscord $ D.def
                { D.discordToken = T.pack token
                , D.discordOnEvent = eventHandler stateRef
                }
            TIO.putStrLn userFacingError

eventHandler :: IORef BotState -> D.Event -> D.DiscordHandler ()
eventHandler stateRef event =
    case event of
        D.MessageCreate m -> when (not (fromBot m)) $ handleCommand stateRef m
        _                 -> pure ()

handleCommand :: IORef BotState -> D.Message -> D.DiscordHandler ()
handleCommand stateRef m
    | isCommandWithMention "!crit20" m = handleAddCommand stateRef CritSuccess m
    | isCommandWithMention "!crit1" m = handleAddCommand stateRef CritFailure m
    | otherwise = pure ()

handleAddCommand :: IORef BotState -> CritType -> D.Message -> D.DiscordHandler ()
handleAddCommand stateRef critType m = Reader.ask >>= \handle -> liftIO $ do
    -- React to the message
    Reader.runReaderT (createReaction reactionName m) handle

    -- Add a crit to the state
    case critType of
        CritSuccess -> modifyIORef stateRef $ \state -> BotState {
              failures = failures state
            , successes = Map.insertWith (+) userId 1 (successes state)
            }
        CritFailure -> modifyIORef stateRef $ \state -> BotState {
              successes = successes state
            , failures = Map.insertWith (+) userId 1 (failures state)
            }

    -- Log the username (Debug Purposes)
    putStrLn $ "Added a crit for user: " ++ (show $ userId)

    -- Read the new total
    state <- readIORef stateRef
    let accessor = if critType == CritSuccess then successes else failures
        map      = accessor state
        countM   = Map.lookup userId map

    -- Log the count (Debug Purposes)
    putStrLn $ show countM

    -- Report current count
    let count       = maybe 0 id countM 
        critTypeStr = if critType == CritSuccess then "successes" else "failures"
        uname = T.unpack $ D.userName targetUser
        msg         = uname ++ " has " ++ (show count) ++ " crit " ++ critTypeStr
    Reader.runReaderT (createMessage (T.pack msg) m) handle

    pure ()
    where
        reactionName = if critType == CritSuccess then "ok_hand" else "cry"
        targetUser   = head $ D.messageMentions m
        userId       = D.userId $ targetUser 

createReaction :: T.Text -> D.Message -> D.DiscordHandler (Either D.RestCallErrorCode ())
createReaction reactionName m =
    D.restCall (D.CreateReaction (D.messageChannel m, D.messageId m) reactionName)

createMessage :: T.Text -> D.Message -> D.DiscordHandler (Either D.RestCallErrorCode D.Message)
createMessage messageText m =
    D.restCall (D.CreateMessage (D.messageChannel m) messageText)

fromBot :: D.Message -> Bool
fromBot = D.userIsBot . D.messageAuthor

isCommandWithMention :: T.Text -> D.Message -> Bool
isCommandWithMention prefix m = 
    let hasPrefix = (prefix `T.isPrefixOf`) $ T.toLower $ D.messageText m
        hasMention = 1 == (length $ D.messageMentions m)
    in hasPrefix && hasMention


