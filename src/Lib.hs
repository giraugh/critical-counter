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
import           Data.List (union)
import           Data.Maybe (fromMaybe)
import           Data.IORef (newIORef, readIORef, writeIORef, modifyIORef, IORef)
import           System.IO (hPutStrLn, stderr)
import           System.Environment (lookupEnv)
import           Control.Monad (when, unless, void, forM_)
import           Control.Monad.Trans (liftIO)
import           System.Directory (doesFileExist)

type CritCounts = (Int, Int)

fmtCounts :: CritCounts -> String
fmtCounts (s, f) = 
    unwords [
          embolden $ show s
        , pluralise "nat 20" s
        , "and"
        , embolden $ show f
        , pluralise "nat 1" f
        ]

successes :: CritCounts -> Int
successes = fst

failures :: CritCounts -> Int
failures = snd

success :: CritCounts
success = (1, 0)

failure :: CritCounts
failure = (0, 1)

combineCounts :: CritCounts -> CritCounts -> CritCounts
combineCounts (a, b) (c, d) = (a + c, b + d)

type BotState = Map.Map D.UserId CritCounts
data CritType = CritSuccess | CritFailure deriving (Eq)

statePath :: FilePath
statePath = "bot-state.dat"

runBot :: IO ()
runBot = do
    stateRef <- newIORef Map.empty 
    tokenM <- lookupEnv "DISCORD_TOKEN"
    case tokenM of
        Nothing ->
            hPutStrLn stderr "Expected environment variable DISCORD_TOKEN"
        Just token -> do
            putStrLn "Starting bot..."
            userFacingError <- D.runDiscord $ D.def
                { D.discordToken = T.pack token
                , D.discordOnEvent = eventHandler stateRef
                , D.discordOnStart = botStart stateRef
                , D.discordOnEnd = botEnd stateRef
                }
            TIO.putStrLn userFacingError


botStart :: IORef BotState -> D.DiscordHandler ()
botStart stateRef = Reader.ask >>= \handle -> liftIO $ do
    exists <- doesFileExist statePath
    when exists $ do
        stateStr <- readFile statePath 
        writeIORef stateRef $ read stateStr

botEnd :: IORef BotState -> IO ()
botEnd stateRef = do
    state <- readIORef stateRef
    writeFile statePath $ show state

eventHandler :: IORef BotState -> D.Event -> D.DiscordHandler ()
eventHandler stateRef event =
    case event of
        D.MessageCreate m -> unless (fromBot m) $ handleCommand stateRef m
        _                 -> pure ()

handleCommand :: IORef BotState -> D.Message -> D.DiscordHandler ()
handleCommand stateRef m
    | isCommandWithMention "!crit20" m = handleAddCommand stateRef CritSuccess m
    | isCommandWithMention "!crit1" m  = handleAddCommand stateRef CritFailure m
    | isCommandWithMention "!crits" m  = handleGetCommand stateRef m
    | isCommandWithoutMention "!crits" m = handleGetAllCommand stateRef m
    | otherwise = pure ()

handleGetAllCommand :: IORef BotState -> D.Message -> D.DiscordHandler ()
handleGetAllCommand stateRef m = Reader.ask >>= \handle -> liftIO $ do
    -- React to the message
    Reader.runReaderT (createReaction "thumbsup" m) handle

    -- Get the state
    state <- readIORef stateRef

    -- Get a list of all members
    let guildIdM = D.messageGuild m
    
    case guildIdM of
        Just guildId -> do
            let pairs = Map.toList state
            forM_ pairs $ \(userId, counts) -> do
                res <- Reader.runReaderT (D.restCall $ D.GetGuildMember guildId userId) handle
                case res of
                    Left err -> print $ "Error fetching user: " ++ show err
                    Right member ->
                        let user  = D.memberUser member
                            uname = T.unpack $ D.userName user 
                            msg   = italicise uname ++ " has " ++ fmtCounts counts
                        in do
                            Reader.runReaderT (createMessage (T.pack msg) m) handle
                            pure ()
        Nothing -> pure ()

    pure ()

handleGetCommand :: IORef BotState -> D.Message -> D.DiscordHandler ()
handleGetCommand stateRef m = Reader.ask >>= \handle -> liftIO $ do
    -- React to the message
    Reader.runReaderT (createReaction "thumbsup" m) handle

    -- Get the state
    state <- readIORef stateRef

    -- Get crits
    let counts = fromMaybe (0,0) $ Map.lookup userId state
        msg    = italicise uname ++ " has " ++ fmtCounts counts 

    -- Message results
    Reader.runReaderT (createEmbed "" (T.pack msg) m) handle

    pure ()
    where
        targetUser = head $ D.messageMentions m
        userId     = D.userId targetUser 
        uname      = T.unpack $ D.userName targetUser

handleAddCommand :: IORef BotState -> CritType -> D.Message -> D.DiscordHandler ()
handleAddCommand stateRef critType m = Reader.ask >>= \handle -> liftIO $ do
    -- React to the message
    Reader.runReaderT (createReaction reactionName m) handle

    -- Add a crit to the state
    case critType of
        CritSuccess -> modifyIORef stateRef $ \state ->
            Map.insertWith combineCounts userId success state
        CritFailure -> modifyIORef stateRef $ \state ->
            Map.insertWith combineCounts userId failure state

    -- Read the new total
    state <- readIORef stateRef
    let accessor = if critType == CritSuccess then successes else failures
        countsM  = Map.lookup userId state
        count    = accessor $ fromMaybe (0,0) countsM

    -- Report current count
    let critTypeStr = if critType == CritSuccess then "nat 20" else "nat 1"
        msg         = unwords [
                          italicise uname
                        , "now has"
                        , embolden $ show count
                        , pluralise critTypeStr count
                        ]
    Reader.runReaderT (createEmbed "" (T.pack msg) m) handle

    pure ()
    where
        reactionName = if critType == CritSuccess then "ok_hand" else "cry"
        targetUser   = head $ D.messageMentions m
        userId       = D.userId targetUser 
        uname        = T.unpack $ D.userName targetUser

createReaction :: T.Text -> D.Message -> D.DiscordHandler (Either D.RestCallErrorCode ())
createReaction reactionName m =
    D.restCall $ D.CreateReaction (D.messageChannel m, D.messageId m) reactionName

createMessage :: T.Text -> D.Message -> D.DiscordHandler (Either D.RestCallErrorCode D.Message)
createMessage messageText m =
    D.restCall $ D.CreateMessage (D.messageChannel m) messageText

createEmbed :: T.Text -> T.Text -> D.Message -> D.DiscordHandler (Either D.RestCallErrorCode D.Message)
createEmbed embedTitle embedText m = 
    D.restCall $ D.CreateMessageEmbed (D.messageChannel m) "" $ D.CreateEmbed {
         D.createEmbedAuthorName = "Critical Counter"
       , D.createEmbedAuthorUrl = "http://github.com/retroverse/critical-counter"
       , D.createEmbedAuthorIcon = Nothing
       , D.createEmbedTitle = ""
       , D.createEmbedUrl = ""
       , D.createEmbedThumbnail = Nothing
       , D.createEmbedDescription = embedText
       , D.createEmbedFields = []
       , D.createEmbedImage = Nothing
       , D.createEmbedFooterText = ""
       , D.createEmbedFooterIcon = Nothing
       } 

isCommandWithMention :: T.Text -> D.Message -> Bool
isCommandWithMention prefix m = 
    let hasPrefix  = (prefix `T.isPrefixOf`) $ T.toLower $ D.messageText m
        hasMention = 1 == length (D.messageMentions m)
    in hasPrefix && hasMention

isCommandWithoutMention :: T.Text -> D.Message -> Bool
isCommandWithoutMention prefix m =
    let hasPrefix  = (prefix `T.isPrefixOf`) $ T.toLower $ D.messageText m
        hasNoMentions = null (D.messageMentions m)
    in hasPrefix && hasNoMentions

fromBot :: D.Message -> Bool
fromBot = D.userIsBot . D.messageAuthor

embolden :: String -> String
embolden str = "**" ++ str ++ "**"

italicise :: String -> String
italicise str = "*" ++ str ++ "*"

pluralise :: String -> Int -> String
pluralise str 1 = str
pluralise str x = str ++ "s" 

