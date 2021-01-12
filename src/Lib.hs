{-# LANGUAGE OverloadedStrings #-}

module Lib
    ( runBot
    ) where

import qualified Discord as D
import qualified Discord.Types as D
import qualified Discord.Requests as D
import qualified Data.Text as T
import qualified Data.Text.IO as TIO
import           System.IO (hPutStrLn, stderr)
import           System.Environment (lookupEnv)
import           Control.Monad (when, void)

runBot :: IO ()
runBot = do
    tokenM <- lookupEnv "DISCORD_TOKEN"
    case tokenM of
        Nothing ->
            hPutStrLn stderr "Expected environment variable DISCORD_TOKEN"
        Just token -> do
            putStrLn "Starting bot..."
            userFacingError <- D.runDiscord $ D.def
                { D.discordToken = T.pack token
                , D.discordOnEvent = eventHandler
                }
            TIO.putStrLn userFacingError

eventHandler :: D.Event -> D.DiscordHandler ()
eventHandler event = case event of
    D.MessageCreate m ->
        when (not (fromBot m) && isPing (D.messageText m)) $ do
            _ <- D.restCall (D.CreateReaction (D.messageChannel m, D.messageId m) "eyes")
            _ <- D.restCall (D.CreateMessage (D.messageChannel m) "Pong!")
            pure ()
    _ -> pure ()

fromBot :: D.Message -> Bool
fromBot = D.userIsBot . D.messageAuthor

isPing :: T.Text -> Bool
isPing = ("!ping" `T.isPrefixOf`) . T.toLower
