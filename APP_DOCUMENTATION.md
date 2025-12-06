# TillSave - Comprehensive App Documentation

## Table of Contents
1. [Application Overview](#application-overview)
2. [Use Cases](#use-cases)
3. [Key Features](#key-features)
4. [User Roles](#user-roles)
5. [Monetization Strategy](#monetization-strategy)
6. [Revenue Streams](#revenue-streams)
7. [Market Analysis](#market-analysis)
8. [Implementation Roadmap](#implementation-roadmap)

---

## Application Overview

**TillSave** is a collaborative savings group management platform that enables communities to organize, track, and manage pooled savings efficiently. Built with React, TypeScript, and Supabase, it provides real-time payment tracking, analytics, and organizer earnings management.

### Target Market
- Developing markets (Africa, Southeast Asia)
- Communities with limited access to traditional banking
- Informal savings groups (ROSCAs - Rotating Savings and Credit Associations)
- Microfinance institutions and NGOs

### Core Value Proposition
- **Transparent**: Real-time payment tracking and group analytics
- **Secure**: PIN-protected accounts, encrypted data
- **Accessible**: Mobile-friendly, multi-currency support, multiple language options (English, French, Kinyarwanda, Swahili)
- **Scalable**: Supports unlimited groups and members per organizer

---

## Use Cases

### 1. **Community Savings Groups (ROSCA/Merry-Go-Rounds)**
**Scenario**: 20 women in Rwanda want to save collectively for household improvements

**How TillSave Helps**:
- Organizer sets up a group with cycle duration (e.g., 20 weeks, each member saves weekly)
- Members contribute their daily savings via mobile payment (MTN Mobile Money, Airtel Money)
- App tracks who paid, who's missed, and when the cycle completes
- Each week/month, one member receives the pooled savings (ROT system)
- Real-time dashboard shows savings progress and member participation

**Expected Savings**: RWF 2,000-5,000/week × 20 members = RWF 40,000-100,000/week

**Developer Revenue**: 1-2% commission = RWF 400-2,000/week per group

---

### 2. **Family Vacation/Holiday Savings**
**Scenario**: Extended family in Kenya wants to fund annual reunion

**How TillSave Helps**:
- Family organizer creates 12-month savings cycle
- 8 family members contribute monthly (e.g., KES 5,000 each)
- App shows progress toward vacation fund goal
- Analytics show projected completion date
- Members can see detailed breakdown of who's paid, total accumulated, and remaining time

**Expected Savings**: KES 5,000 × 8 members × 12 months = KES 480,000

**Developer Revenue**: 1.5% commission = KES 7,200

---

### 3. **Emergency Fund Collective**
**Scenario**: 15 church members want to build emergency mutual aid fund

**How TillSave Helps**:
- Open-ended savings cycle (no fixed end date)
- Members contribute flexible amounts whenever possible
- App tracks emergency withdrawals and contributions
- Real-time balance shows available emergency funds
- Transparency report shows how emergency funds are allocated

**Expected Savings**: UGX 50,000-200,000/member/year

**Developer Revenue**: Commission per transaction or subscription model

---

### 4. **School Fee Savings Groups (Education Focus)**
**Scenario**: 10 mothers in Tanzania want to ensure education funding for children

**How TillSave Helps**:
- Annual cycle aligned with school calendar
- Track savings progress toward school fee deadlines
- Analytics show per-child savings accumulation
- Calendar alerts remind of payment deadlines
- Receipt generation for school payments from pooled funds

**Expected Savings**: TZS 500,000-1,000,000/year per group (school fees)

**Developer Revenue**: 1% commission on school fee payments

---

### 5. **Small Business Capital Accumulation**
**Scenario**: 8 traders in Uganda want to fund business inventory expansion

**How TillSave Helps**:
- 6-12 month savings cycle toward specific investment goal
- Members see breakdown of who's contributed most (top performers)
- Payout schedule shows when each member receives disbursement
- Analytics show projected ROI if funds are invested

**Expected Savings**: UGX 500,000-2,000,000/member × 8 = UGX 4M-16M

**Developer Revenue**: 1.5% commission = UGX 60K-240K per cycle

---

### 6. **Microfinance Institution Integration**
**Scenario**: MFI in Rwanda wants to offer savings groups to 500+ customers

**How TillSave Helps**:
- White-label version of TillSave branded with MFI logo
- Centralizes tracking of all member savings groups
- MFI can offer premium features (insurance, loans against savings)
- Analytics dashboard for MFI management team

**Expected Usage**: 500 groups × 20 members = 10,000 active users

**Developer Revenue**: Licensing fee + per-active-user fee

---

### 7. **NGO Financial Literacy Program**
**Scenario**: NGO running financial inclusion program in 5 countries

**How TillSave Helps**:
- Training tool for financial literacy workshops
- Real savings groups created as part of program
- Data for impact reporting and case studies
- Longitudinal tracking of savings behavior

**Expected Usage**: 100 groups across 5 countries

**Developer Revenue**: Program partnership fee or per-region licensing

---

### 8. **Corporate Wellness Savings Program**
**Scenario**: HR department at tech company wants employee wellness savings group

**How TillSave Helps**:
- Employee group savings for health emergencies
- Employer can match contributions (automation available)
- Transparent reporting for compliance and audit
- Integration with corporate payroll for automatic deductions

**Expected Usage**: 50 employees, RWF 50,000/month each

**Developer Revenue**: Enterprise license + per-employee fee

---

## Key Features

### For Members
- ✅ Real-time payment tracking
- ✅ Personal dashboard showing savings progress
- ✅ Mobile payment integration (MTN, Airtel, etc.)
- ✅ PIN-protected account security
- ✅ Payment receipt generation
- ✅ Group analytics (completion rate, savings trend)
- ✅ Multi-language support
- ✅ Dark mode for eye comfort

### For Organizers
- ✅ Group management and member invitations
- ✅ Payment verification and manual entry
- ✅ Comprehensive analytics dashboard
- ✅ Global reporting with trends
- ✅ Payout generation and scheduling
- ✅ Member performance reports
- ✅ Earnings tracking (commissions if enabled)
- ✅ Export reports as PDF

### For Platform (Developer)
- ✅ Multi-currency transaction handling
- ✅ Real-time analytics aggregation
- ✅ Scalable architecture (Supabase)
- ✅ Mobile-responsive design
- ✅ Automated payout calculations

---

## User Roles

### Member
- Contributes to group savings
- Views personal progress and group analytics
- Receives payment receipts
- Cannot create or modify groups

### Organizer
- Creates and manages savings groups
- Invites and manages members
- Verifies payments and generates reports
- Schedules and manages payouts
- Views organizer earnings if commission enabled

### Administrator (Future)
- Manages multiple organizers (white-label scenarios)
- Views platform-wide analytics
- Manages user support tickets
- Handles disputes and compliance

---

## Monetization Strategy

### 1. **Transaction Commission Model** (Primary)
**Implementation**: 1-2% commission on all payments processed through TillSave

**Revenue Calculation**:
- Average group: 15 members
- Average contribution per member per cycle: RWF 50,000
- Cycle frequency: Monthly (12 cycles/year)
- Commission rate: 1.5%

**Math**:
```
Annual Revenue per Group = 15 members × RWF 50,000 × 12 months × 1.5%
                         = RWF 13,500,000 × 1.5%
                         = RWF 202,500/group/year
```

**Scaling**:
- 100 groups = RWF 20.25M/year
- 500 groups = RWF 101.25M/year
- 1,000 groups = RWF 202.5M/year

### 2. **Premium Features Subscription**
**Monthly/Annual Subscription Tiers**:

| Feature | Free | Pro | Enterprise |
|---------|------|-----|-----------|
| Groups | 1 | Unlimited | Unlimited |
| Members per Group | 20 | Unlimited | Unlimited |
| Payment History | 30 days | Unlimited | Unlimited |
| Analytics | Basic | Advanced | Advanced + API |
| PDF Reports | 5/month | Unlimited | Unlimited |
| Email Support | No | Yes | Priority |
| Custom Branding | No | No | Yes |
| API Access | No | No | Yes |
| Price (Monthly) | Free | $5-10 | $50-100 |

**Revenue Model**:
- 10% of users upgrade to Pro: 100 groups × 1 organizer × 10% × $7/month × 12 = $8,400/year
- 2% upgrade to Enterprise: 100 groups × 2% × $75/month × 12 = $18,000/year

**Annual Premium Revenue** (100 groups baseline): ~$26,400

### 3. **White-Label Licensing**
**For**: Microfinance institutions, NGOs, enterprise clients

**Pricing Structure**:
- **Setup Fee**: $5,000-$20,000 (one-time)
- **Monthly License**: $500-$5,000 (based on active users)
- **Per-User Fee**: $0.50-$2.00/active user/month

**Example (MFI with 500 users)**:
```
Monthly Cost = $2,000 (license) + (500 users × $1.00) = $2,500
Annual Cost = $30,000
```

**Revenue with 5 MFI Clients**: $150,000/year

### 4. **Payment Processing Fee Share**
**Implementation**: Partner with mobile money providers

**Model**: Charge users a small processing fee (0.5-1%) which is split with payment provider
- User pays: 0.5% processing fee
- TillSave receives: 0.3-0.4%
- Payment provider receives: 0.1-0.2%

**Example**:
- Average transaction: RWF 50,000
- Processing fee: 0.4% = RWF 200
- 500 groups × 15 members × 4 payments/month = 30,000 payments/month
- Revenue: 30,000 × RWF 200 × 0.4 = RWF 2.4M/month

### 5. **Data Analytics & Reporting Services**
**For**: Financial institutions, researchers, NGOs

**Products**:
- Anonymous savings trend reports
- Regional financial behavior analytics
- Financial inclusion metrics
- Custom research datasets

**Pricing**: $500-$5,000/report or $1,000-$10,000/month subscription

### 6. **Insurance & Credit Products Integration**
**Partners**: Insurance companies, microfinance lenders

**Products**:
- Savings protection insurance (death, disability)
- Emergency loans against savings
- Savings-linked insurance products

**Revenue**: 5-10% commission on premiums or loan origination fees

---

## Revenue Streams Summary

### Conservative Scenario (Year 1)
- **Transaction Commission** (100 groups): RWF 20.25M
- **Premium Subscriptions**: $8,400 (= RWF ~8.4M)
- **White-Label License** (1 client): $30,000 (= RWF ~30M)
- **Total Year 1**: ~RWF 58.65M (~$58,650 USD)

### Moderate Scenario (Year 2)
- **Transaction Commission** (500 groups): RWF 101.25M
- **Premium Subscriptions**: $42,000 (= RWF ~42M)
- **White-Label License** (3 clients): $90,000 (= RWF ~90M)
- **Insurance/Credit** (early stage): RWF 10M
- **Total Year 2**: ~RWF 243.25M (~$243,250 USD)

### Aggressive Scenario (Year 3)
- **Transaction Commission** (2,000 groups): RWF 405M
- **Premium Subscriptions**: $168,000 (= RWF ~168M)
- **White-Label License** (10 clients): $300,000 (= RWF ~300M)
- **Insurance/Credit**: RWF 50M
- **Data Analytics**: $50,000 (= RWF ~50M)
- **Total Year 3**: ~RWF 973M (~$973,000 USD)

---

## Market Analysis

### Target Geographic Markets

#### 1. **East Africa** (Highest Potential)
- **Countries**: Rwanda, Uganda, Tanzania, Kenya
- **Population**: ~200M
- **Unbanked %**: 65-80%
- **Informal Savings Groups**: Estimated 5M+ groups
- **Market Size**: If 1% adopt TillSave = 50,000 groups

**Key Factors**:
- Strong mobile money penetration (MTN, Airtel, Vodafone)
- Cultural tradition of savings groups (ROSCA/Merry-Go-Rounds)
- Growing smartphone adoption
- Limited banking infrastructure

#### 2. **West Africa**
- **Countries**: Ghana, Nigeria, Senegal, Côte d'Ivoire
- **Population**: ~400M
- **Unbanked %**: 55-70%
- **Potential**: Larger market but more competition

#### 3. **Southeast Asia** (Secondary)
- **Countries**: Philippines, Indonesia, Vietnam
- **Similar informal savings traditions**: Paluwagan, Ipon
- **Growing fintech adoption**

### Market Opportunity
- **TAM (Total Addressable Market)**: East Africa informal savings market ≈ $50-100B/year in saved funds
- **SAM (Serviceable Available Market)**: 5% of TAM = $2.5-5B/year
- **SOM (Serviceable Obtainable Market)**: Year 3-5 target = $10-50M/year in transaction volume

### Competitive Landscape
- **Direct Competitors**: Few direct competitors in emerging markets
- **Indirect Competitors**: Traditional banks, mobile money providers, spreadsheet-based tracking
- **Opportunity**: First-mover advantage in East Africa region

---

## Implementation Roadmap

### Phase 1: MVP Launch (Months 1-3) ✅
- ✅ Core savings group functionality
- ✅ Mobile-responsive design
- ✅ Multi-currency support
- ✅ Basic analytics
- **Status**: COMPLETE

### Phase 2: Monetization Enablement (Months 4-6)
- [ ] Implement transaction commission tracking
- [ ] Add payment processing integration
- [ ] Build premium feature gates
- [ ] Create admin dashboard for analytics

### Phase 3: Enterprise Features (Months 7-12)
- [ ] White-label configuration system
- [ ] API for third-party integrations
- [ ] Advanced reporting and exports
- [ ] Multi-organizer management dashboard

### Phase 4: Ecosystem Expansion (Months 13-18)
- [ ] Insurance product integration
- [ ] Micro-loan features
- [ ] Savings goal templates
- [ ] Gamification (badges, leaderboards)

### Phase 5: Regional Expansion (Months 19-24)
- [ ] Deploy to 3+ countries
- [ ] Partner with 5+ MFIs/NGOs
- [ ] Local payment provider integrations
- [ ] Regional marketing campaigns

---

## Financial Projections Summary

### Monthly Burn Rate & Profitability
```
Monthly Operating Costs (Year 1):
- Cloud Infrastructure (Supabase): $1,000
- Domain & Hosting: $200
- Payment Processing: 0.5% of volume
- Support & Operations: $2,000
- Marketing: $1,000
Total: ~$4,200/month

Break-Even Point:
- At 1.5% commission rate: Need ~RWF 280M/month in transactions
- Equivalent to: ~1,400 groups × RWF 200K/month average
- Timeline: 12-18 months at aggressive growth
```

### Profitability Timeline
- **Months 1-6**: Negative (investment phase)
- **Months 7-12**: Break-even to modest profit with transaction volume
- **Year 2**: 40-60% gross margin
- **Year 3+**: 70%+ gross margin at scale

---

## Go-to-Market Strategy

### Phase 1: Community Partnerships
- Partner with 5-10 community organizations
- Deploy app with organic user growth
- Gather testimonials and case studies

### Phase 2: MFI Partnerships
- Approach microfinance institutions in Rwanda/Uganda
- Offer white-label solution
- Generate licensing revenue

### Phase 3: Digital Marketing
- Social media campaigns targeting savings groups
- YouTube tutorials in local languages
- WhatsApp business groups

### Phase 4: Strategic Partnerships
- Integrate with popular mobile money providers
- Partner with NGOs for financial literacy programs
- B2B sales to corporate HR departments

---

## Success Metrics

### User Engagement
- Active groups: Target 1,000 by end of Year 2
- Active users: Target 20,000 by end of Year 2
- Transaction volume: Target $500K/month by end of Year 2
- Monthly churn rate: <5%

### Business Metrics
- Revenue per group/month: RWF 16,875 average
- Customer Lifetime Value: RWF 2-5M (annual)
- Cost of Acquisition: <RWF 500K per group
- Payback period: <6 months

### User Satisfaction
- NPS Score: Target 50+
- App rating: Target 4.5+/5 stars
- Member satisfaction: >80% report improvement in transparency

---

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Regulatory uncertainty | High | Medium | Partner with compliant MFIs first |
| Payment provider changes | Medium | Medium | Maintain multiple provider integrations |
| Market saturation | Medium | Low | Expand to adjacent markets early |
| Poor adoption | High | Medium | Focus on organic growth through communities |
| Competition from banks | Medium | Low | Emphasize informal sector advantage |

---

## Conclusion

TillSave addresses a critical gap in financial services for unbanked populations in emerging markets. With a clear path to profitability through transaction commissions, premium subscriptions, and white-label licensing, the application has significant revenue potential within 18-24 months.

**Key Takeaways**:
1. **Large TAM**: $50-100B+ informal savings market in East Africa alone
2. **Multiple Revenue Streams**: Not dependent on single monetization method
3. **High Unit Economics**: 1.5% commission on $200K+ annual group savings
4. **Scalable Model**: Can reach profitability with 1,000-2,000 active groups
5. **Social Impact**: Improves financial inclusion while generating revenue

**Recommended Next Steps**:
1. Begin Phase 2 (Monetization Enablement) immediately
2. Negotiate payment processor partnerships
3. Identify 5-10 pilot MFI partners
4. Develop white-label configuration system
5. Create detailed financial tracking dashboard

