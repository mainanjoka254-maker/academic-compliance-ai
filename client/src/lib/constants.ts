import type { Plan } from './types'

export const CONTACT = {
  phone: '0140844495',
  phoneHref: 'tel:+254140844495',
  email: 'mainanjoka254@gmail.com',
  emailHref: 'mailto:mainanjoka254@gmail.com',
  hours: 'Mon – Fri · 8:00 – 18:00 EAT',
}

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    cadence: 'forever',
    tagline: 'For individual lecturers exploring AI compliance.',
    features: [
      'Up to 20 document scans / month',
      'Core compliance rules engine',
      'Email support',
      '1 workspace seat',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 49,
    cadence: 'per month',
    tagline: 'For departments running continuous audits.',
    highlighted: true,
    features: [
      'Unlimited document scans',
      'Advanced AI risk scoring',
      'Audit-ready PDF exports',
      'Priority support',
      'Up to 10 workspace seats',
    ],
  },
  {
    id: 'institution',
    name: 'Institution',
    price: 199,
    cadence: 'per month',
    tagline: 'For universities needing org-wide governance.',
    features: [
      'Everything in Professional',
      'SSO & role-based access',
      'Custom compliance frameworks',
      'Dedicated success manager',
      'Unlimited seats',
    ],
  },
]
