#!/bin/zsh
set -euo pipefail

SUBJECT="${1:?Usage: send_digest_mail.sh <subject> <markdown_file_path>}"
BODY_FILE="${2:?Usage: send_digest_mail.sh <subject> <markdown_file_path>}"
RECIPIENT="blogpost@birchville.org"
SENDER="mdemarmels@gmail.com"

open -g -a "Mail"
for i in {1..15}; do
  if pgrep -qx "Mail"; then
    break
  fi
  sleep 1
done
sleep 2

osascript - "$SUBJECT" "$BODY_FILE" "$RECIPIENT" "$SENDER" <<'APPLESCRIPT'
on run argv
  set msgSubject to item 1 of argv
  set bodyPath to item 2 of argv
  set recipientAddress to item 3 of argv
  set senderAddress to item 4 of argv
  set msgContent to (read POSIX file bodyPath as «class utf8»)
  set approvalFooter to return & return & "--------------------------------------------------" & return & "FREIGABE & PUBLIKATION (Modell A - Human-in-the-Loop):" & return & "Dieser Bericht liegt als Entwurf im Blog-Projekt bereit." & return & "Zur Veröffentlichung im Terminal ausführen:" & return & "  ./publish_report.sh" & return & "Oder im Pair-Programming-Chat: 'Monatsbericht freigeben'." & return & "--------------------------------------------------"
  set finalContent to msgContent & approvalFooter
  tell application "Mail"
    set newMessage to make new outgoing message with properties {subject:msgSubject, content:finalContent, visible:false, sender:senderAddress}
    tell newMessage
      make new to recipient at end of to recipients with properties {address:recipientAddress}
    end tell
    send newMessage
  end tell
end run
APPLESCRIPT
