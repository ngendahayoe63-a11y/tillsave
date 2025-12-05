# TillSave - Beta Testing Checklist

**Version**: v1.0.0-beta  
**Date**: December 5, 2025  
**Test Environment**: Production (Vercel)  
**Branch**: master

---

## 🚀 Getting Started

### Access Information
- **URL**: [Your Vercel URL]
- **Browser Support**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile**: iOS Safari, Android Chrome recommended

### Test Account Credentials
```
Organizer Test Account:
- Email: organizer.test@example.com
- Password: [Provided separately]
- PIN: [Provided separately]

Member Test Account:
- Email: member.test@example.com
- Password: [Provided separately]
- PIN: [Provided separately]
```

---

## ✅ Testing Scenarios

### Phase 1: Authentication (Day 1)

**Organizer Registration & Login:**
- [ ] Register with phone number
- [ ] Receive and verify OTP
- [ ] Set PIN successfully
- [ ] Login with email/password
- [ ] Login with PIN works
- [ ] Forgot password flow works
- [ ] Logout works

**Member Registration & Login:**
- [ ] Same as organizer steps
- [ ] Multiple languages work (switch in settings)

**Test on:**
- [ ] Desktop (Chrome)
- [ ] Mobile (Safari/Chrome)
- [ ] Dark mode

---

### Phase 2: Organizer Features (Days 2-3)

**Create & Manage Group:**
- [ ] Create new group with name
- [ ] Set cycle days (default 30)
- [ ] See join code on dashboard card
- [ ] Copy join code easily
- [ ] View group details
- [ ] Group shows on dashboard

**Group Members:**
- [ ] Add member by joining with code (as member)
- [ ] See members list (without duplicates)
- [ ] See member with Crown icon (organizer)
- [ ] Other members show with green "Pay" button
- [ ] Member count is correct

**Record Payments:**
- [ ] Click "Pay" button on member
- [ ] Select currency (at least 2)
- [ ] Enter amount manually
- [ ] Enter payment date
- [ ] Add receipt photo (optional)
- [ ] Submit payment
- [ ] Payment appears in history

**Organizer Savings:**
- [ ] As organizer, can also save in their group
- [ ] Click "Pay" on self with Crown icon
- [ ] Record payment to yourself
- [ ] Your savings show in member list

**Analytics:**
- [ ] View group analytics (Insights button)
- [ ] View global report page
- [ ] See member contributions
- [ ] See financial charts
- [ ] Stats display correctly

---

### Phase 3: Member Features (Days 2-3)

**Join Group:**
- [ ] Receive join code from organizer
- [ ] Go to "Join Group" page
- [ ] Enter join code
- [ ] Successfully join group
- [ ] Group appears on dashboard

**Currency Setup:**
- [ ] Click "Setup" on group card
- [ ] Select currency (RWF, USD, KES, UGX, TZS)
- [ ] Enter daily savings goal amount
- [ ] Save successfully
- [ ] Can add multiple currencies

**Make Payment:**
- [ ] View group card
- [ ] See saved amount during cycle
- [ ] ⚠️ NO FEE shown during cycle (only saved amount)
- [ ] Click "View Payout" to see preview
- [ ] View personal analytics

**Savings Tracking:**
- [ ] Health score displays
- [ ] Savings streak tracks
- [ ] Can view payment history
- [ ] Past cycle history shows

**On Last Day of Cycle:**
- [ ] Fee line appears on member card
- [ ] Shows deduction clearly
- [ ] Members understand fees

---

### Phase 4: Multi-Currency & Multiple Groups (Days 4-5)

**Multi-Currency in One Group:**
- [ ] Setup 2+ currencies in same group
- [ ] Make payments in different currencies
- [ ] See each currency tracked separately
- [ ] Fee calculated correctly per currency

**Multiple Groups:**
- [ ] Join 2-3 different groups
- [ ] Dashboard shows all groups
- [ ] Switch between groups easily
- [ ] Stats calculated per group correctly

---

### Phase 5: Complete Cycle (Days 6-7)

**End Cycle & Payout:**
- [ ] Organizer clicks "End Cycle & Payout"
- [ ] See payout summary
- [ ] Fees deducted from member payouts
- [ ] Organizer earnings calculated
- [ ] Members see payout amounts
- [ ] Next cycle starts

**Verify Calculations:**
- [ ] Total members × daily rate = expected amount
- [ ] Fee = 1 day's rate (verify)
- [ ] Net = total - fee (verify)
- [ ] Organizer earnings accurate

---

### Phase 6: Edge Cases & Bug Hunting (Days 8)

**Try to Break It:**
- [ ] Join group mid-cycle (prorated?)
- [ ] Exit group and rejoin
- [ ] Very large payment amounts
- [ ] Very small payment amounts
- [ ] Decimal amounts
- [ ] Rapid payment submissions
- [ ] Network disconnect (try offline)
- [ ] Browser back button during flow
- [ ] Multiple tabs open

**Mobile-Specific:**
- [ ] Landscape & portrait modes
- [ ] Camera/gallery for receipts
- [ ] Touch interactions smooth
- [ ] Buttons easy to tap
- [ ] No horizontal scroll

**Dark Mode:**
- [ ] All text readable
- [ ] Colors appropriate
- [ ] Charts readable
- [ ] Toggle works smoothly

---

## 🐛 Bug Report Template

**Title**: [Brief Description]

**Severity**: 
- 🔴 Critical (app crashes, data loss, security)
- 🟠 High (major feature broken)
- 🟡 Medium (feature partially broken)
- 🟢 Low (cosmetic, minor)

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**:
- What should happen

**Actual Behavior**:
- What actually happens

**Environment**:
- Browser: Chrome 120
- Device: iPhone 14 / MacBook
- OS: iOS 17 / macOS 14
- URL: [Full URL]

**Screenshots/Video**:
- [Attach images or video]

**Browser Console Error**:
```
[Copy any error messages]
```

---

## ✨ Feedback Form

**What do you like most?**
- 

**What could be improved?**
- 

**Feature requests?**
- 

**Overall experience (1-10)?**
- 

**Would you use this regularly?**
- Yes / No / Maybe

---

## 📋 Sign-Off Checklist

Before marking "READY FOR PRODUCTION":

- [ ] All Phase 1-5 tests passed
- [ ] No critical bugs found
- [ ] No data loss issues
- [ ] Mobile works well
- [ ] Dark mode works
- [ ] Performance acceptable
- [ ] Error messages helpful
- [ ] User experience smooth

**Final Rating**: ✅ READY / ⚠️ NEEDS FIXES / ❌ NOT READY

**Comments**:
- 

---

## 🔗 Important Links

- **GitHub**: https://github.com/ngendahayoe63-a11y/tillsave
- **Deployed**: [Vercel URL]
- **Issue Tracker**: [GitHub Issues]
- **Slack Channel**: #tillsave-testing

---

## 📞 Support

**Questions?** Reply to this email or comment in Slack  
**Found a bug?** Fill out bug report above  
**Suggestions?** Use feedback form  

**Testing Period**: December 5 - December 19, 2025  
**Thank you for helping test TillSave!** 🙏
