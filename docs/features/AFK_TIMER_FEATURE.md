# AFK Timer Feature Documentation

## Overview

The grievance portal now includes an automatic inactivity timer that logs users out after a period of inactivity for enhanced security.

## How It Works

### Timeline

```
User Activity → 13 minutes idle → Warning appears → 2 minutes to respond → Auto-logout
                       ↓                              ↓                          ↓
                   Still active                 "I'm Still Here!"        Back to password screen
```

### Key Parameters

- **Total Inactivity Time**: 15 minutes
- **Warning Time**: Last 2 minutes (appears at 13-minute mark)
- **Tracked Activities**: Mouse movement, clicks, keyboard input, scrolling, touch events

## User Experience

### During Active Use
- Timer runs silently in background
- Any user interaction resets the timer
- No interruption to normal usage

### When Inactive (After 13 Minutes)
A warning modal appears with:
- ⚠️ Alert icon
- "Still there?" heading
- Live countdown timer (2:00 → 0:00)
- Clear message: "You've been inactive for a while"
- Large "I'm Still Here!" button

### Warning Actions

**If user clicks "I'm Still Here!" button:**
- Timer resets completely
- Warning disappears
- User continues where they left off
- Another 15 minutes before next warning

**If user doesn't respond (timer reaches 0:00):**
- Automatically logged out
- Session cleared from sessionStorage
- Redirected to password screen
- Must re-enter password to continue

## Security Benefits

1. **Unattended Device Protection**: Prevents unauthorized access if device is left open
2. **Session Hijacking Prevention**: Limits session lifetime
3. **Compliance**: Meets security best practices for timeout requirements
4. **Multi-User Environment**: Safe to use in shared spaces (coffee shops, offices)

## Technical Implementation

### Activity Detection
Monitors these events globally:
- `mousedown` - Mouse button pressed
- `mousemove` - Mouse movement
- `keypress` - Keyboard input
- `scroll` - Page scrolling
- `touchstart` - Touch screen interaction
- `click` - Click events

### Timer Architecture
```javascript
INACTIVITY_TIMEOUT = 15 minutes (900,000 ms)
WARNING_TIME = 2 minutes (120,000 ms)

Timeline:
├─ 0:00 - User activity detected
├─ 13:00 - Warning timer triggers
│   └─ Countdown starts (2:00)
└─ 15:00 - Auto-logout if no response
```

### State Management
- Uses React `useRef` for timer references (prevents re-renders)
- Uses React `useState` for UI state (warning visibility, countdown)
- Cleans up all timers on component unmount
- Resets completely on any user activity

## Configuration

You can customize the timeout values in `src/App.js`:

```javascript
// Line 342-343
const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // Change 15 to desired minutes
const WARNING_TIME = 2 * 60 * 1000; // Change 2 to desired warning minutes
```

### Recommended Settings

| Use Case | Inactivity | Warning | Total |
|----------|------------|---------|-------|
| **Personal (Current)** | 13 min | 2 min | 15 min |
| High Security | 3 min | 1 min | 4 min |
| Office Use | 8 min | 2 min | 10 min |
| Public Kiosk | 1 min | 30 sec | 90 sec |
| Home Trusted | 28 min | 2 min | 30 min |

## User Testing Checklist

After deployment, verify:

- [ ] Warning appears after 13 minutes of no activity
- [ ] Countdown shows correct time (2:00 to 0:00)
- [ ] "I'm Still Here!" button resets timer and closes warning
- [ ] Auto-logout happens at 0:00 if no response
- [ ] After logout, password screen appears
- [ ] Any activity (mouse, keyboard) resets timer during active use
- [ ] Multiple warnings work correctly if user keeps clicking "I'm Still Here!"
- [ ] Timer stops when user logs out manually
- [ ] Dark mode styling works on warning modal

## Accessibility

- **Keyboard Accessible**: "I'm Still Here!" button can be activated with Enter/Space
- **Screen Readers**: Alert icon and countdown are visible to assistive tech
- **Reduced Motion**: Respects `prefers-reduced-motion` for fade-in animation
- **High Contrast**: Warning uses yellow/amber colors for visibility

## Mobile Considerations

Works on mobile with touch events:
- Touch scrolling resets timer
- Tapping anywhere resets timer
- Warning modal is responsive and fits small screens
- Large touch target for "I'm Still Here!" button

## Privacy

- Timer is client-side only
- No server logging of activity
- No tracking of specific actions
- Only session state (authenticated/not) is managed

## Troubleshooting

### Warning appears too quickly
- Check system time is correct
- Verify `INACTIVITY_TIMEOUT` value in code
- Ensure no browser extensions blocking events

### Warning doesn't appear
- Check browser console for errors
- Verify authentication is working (must be logged in)
- Test with shorter timeout for debugging

### Button doesn't work
- Check for JavaScript errors
- Verify click events are propagating
- Test in different browser

## Future Enhancements (Optional)

1. **Customizable Timeout**: Let users choose their own timeout in settings
2. **Sound Alert**: Optional audio notification before logout
3. **Activity Log**: Track when warnings appear (for security audit)
4. **Remember Me**: Disable timeout if user checks "Remember Me"
5. **Progressive Warning**: Show countdown in corner after 10 minutes
6. **Sliding Scale**: Shorten timeout after multiple warnings ignored

## Related Files

- `src/App.js` - Main implementation (lines 341-415, 1057-1084)
- `src/index.css` - Fade-in animation (line 72-75, 80)
- `README.md` - Feature documentation

## Deployment Notes

No additional environment variables required. Feature is enabled by default once code is deployed.

To disable temporarily for testing:
```javascript
// In src/App.js, comment out line 394
// const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
```

---

**Feature Status**: ✅ Implemented and Ready for Testing  
**Version Added**: After initial security hardening  
**Last Updated**: Current session

