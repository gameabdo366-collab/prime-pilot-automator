# Prime Pilot

I want to build a personal desktop-style web application for my own use only.

This is NOT a SaaS product.
This is NOT intended for multiple users.
There will only ever be one administrator (me).

The application is an AI-powered browser automation platform.

The first automation driver will be Amazon Egypt Prime annual subscription renewal.

The system must use Playwright as the browser automation engine.

The application should be built entirely inside Lovable using its frontend, backend, database and server capabilities.

The project must be modular because more automation drivers will be added later (ChatGPT, Claude, Microsoft, Spotify, YouTube Premium, etc.).

For now ONLY build the infrastructure and Amazon driver.

----------------------------------------------------
Core Requirements
----------------------------------------------------

Create a dashboard showing:

• Tasks
• Browser Sessions
• Amazon Accounts
• Payment Cards
• Execution History
• Screenshots
• Logs
• Settings

----------------------------------------------------
Amazon Accounts
----------------------------------------------------

Store

Email

Password (encrypted)

Current Prime Status

Renewal Date

Last Execution

Notes

----------------------------------------------------
Payment Cards
----------------------------------------------------

Store

Card Number

Expiry

CVV

Alias

Expiration Time

Cards are temporary virtual prepaid cards.

----------------------------------------------------
Execution Flow
----------------------------------------------------

The Amazon driver should perform:

Launch Chromium

Open amazon.eg

Login

Navigate to Prime page

Check whether Prime is already active

If already active:
Stop immediately without using the payment card.

Otherwise

Select Annual Plan ONLY

Never select Monthly plan.

Verify the displayed annual price before continuing.

Fill payment card.

Fill Egyptian billing address.

Review order.

Complete subscription.

Open Prime page again.

Read membership status.

Read renewal date.

Take screenshots after every important step.

Store execution log.

----------------------------------------------------
OTP Handling
----------------------------------------------------

If OTP appears

Pause execution

Show status

Waiting for OTP

Allow resuming after OTP is entered.

----------------------------------------------------
Error Handling
----------------------------------------------------

If any page changes

Take screenshot

Save page HTML

Store detailed log

Stop safely

----------------------------------------------------
Architecture
----------------------------------------------------

Everything should be modular.

Amazon automation must be one Driver.

Future Drivers can be added without modifying the core engine.

----------------------------------------------------
Important

Do not implement ChatGPT, Claude or any other driver now.

Build only:

Core Automation Platform

Amazon Egypt Prime Driver

The application should be designed for reliability, maintainability and future expansion.

وأقترح إضافة نقطة مهمة جدًا لأنك ذكرت أن النظام سيستخدم بطاقات مسبقة الدفع صالحة لمدة 24 ساعة:

Never reuse a payment card after a successful payment. Mark it as "Consumed" immediately and prevent it from being selected again unless manually reactivated.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://prime-pilot-automator.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0e547aac-940c-434d-ad3a-4c601e05d29b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
