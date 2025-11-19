# Firebase Security Rules for SkyPoint

## Current Rules (Test Mode)
Your current rules allow read/write access until December 19, 2025:
```json
{
  "rules": {
    ".read": "now < 1766124000000",  // 2025-12-19
    ".write": "now < 1766124000000",  // 2025-12-19
  }
}
```

## Recommended Production Rules
For better security, update to these rules in Firebase Console > Realtime Database > Rules:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true,
        ".indexOn": ["joinedAt", "lastSeen"],
        "users": {
          "$userId": {
            ".validate": "newData.hasChildren(['id', 'name', 'hasVoted', 'selectedCard', 'isObserver'])"
          }
        },
        "session": {
          ".validate": "newData.hasChildren() && newData.hasChild('isRevealed')"
        }
      }
    }
  }
}
```

## Even More Secure (Optional)
For production with user authentication:
```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": "auth != null",
        ".write": "auth != null",
        "users": {
          "$userId": {
            ".write": "$userId === auth.uid"
          }
        }
      }
    }
  }
}
```

## Current Status
✅ **Test Mode Active** - Anyone can read/write until Dec 19, 2025
✅ **SkyPoint Integration** - Ready for multi-user sessions
⚠️ **Security Note** - Consider updating rules for production use

## Testing Multi-User Now
Your Firebase is ready! Test cross-device functionality:
1. Open SkyPoint on multiple devices
2. Use same session code
3. See real-time synchronization

The current rules are perfect for testing and development!