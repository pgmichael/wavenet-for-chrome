import React from 'react';

export function PrivacyPolicyPage() {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full bg-neutral-100 text-center p-8 pb-24 border-b border-neutral-200 shadow-sm">
        <h1 className="w-full text-4xl font-bold">Privacy Policy</h1>
      </div>
      <div className="w-full max-w-screen-sm overflow-hidden p-4 flex flex-col gap-3 mt-8">
        <section className='mb-6'>
          <h2 className='text-2xl font-bold mb-2'>1. Introduction</h2>
          <p>Please read this Privacy Policy to learn about how we collect, use, and share your information while using the extension.</p>
        </section>

        <section className='mb-6'>
          <h2 className='text-2xl font-bold mb-2'>2. Information We Collect</h2>
          <ul className='list-disc'>
            <li><strong>OAuth Information:</strong> We collect information such as your email when you authenticate through the OAuth flow using our service.</li>
            <li><strong>Automatically Collected Information:</strong> We collect user IP addresses, usage metrics (ex: synthesized text audio configuration and character counts), and error reports to ensure the effective operation of our services.</li>
          </ul>
        </section>

        <section className='mb-6'>
          <h2 className='text-2xl font-bold mb-2'>3. How We Use Your Information</h2>
          <p>We use the collected information for the following purposes:</p>
          <ul className='list-disc'>
            <li>To gather analytics and understand how our users interact with the application. This aids in determining features to be added and understanding our customer base.</li>
            <li>To collect error reports and address any potential issues, ensuring our service runs smoothly and efficiently.</li>
            <li>For processing payments and authentication.</li>
          </ul>
        </section>

        <section className='mb-6'>
          <h2 className='text-2xl font-bold mb-2'>4. Information Sharing</h2>
          <p>We only share data with these third parties to the extent necessary for the functionality of our service and for the purposes stated in this privacy policy.</p>
          <ul className='list-disc'>
            <li><a href="https://cloud.google.com/" className='text-blue-600 hover:underline font-bold'>Google Cloud</a>: Necessary for the primary function of our extension to synthesize text for playback or download.</li>
            <li><a href="https://railway.app/" className='text-blue-600 hover:underline font-bold'>Railway</a>: Where our backend services are hosted.</li>
            <li><a href="https://supabase.com" className='text-blue-600 hover:underline font-bold'>Supabase</a>: Our database hosting partner, where certain user data is stored.</li>
            <li><a href="https://sentry.io/" className='text-blue-600 hover:underline font-bold'>Sentry</a>: For the purpose of collecting and analyzing error reports.</li>
            <li><a href="https://stripe.com/en-ca" className='text-blue-600 hover:underline font-bold'>Stripe</a>: Our payment processing partner.</li>
          </ul>
        </section>

        <section className='mb-6'>
          <h2 className='text-2xl font-bold mb-2'>5. Data Security</h2>
          <p>Your data is important to us and we have implemented measures to ensure its security. However, no method of data transmission or storage is 100% secure, and while we strive for maximum security, we cannot guarantee it.</p>
        </section>

        <section className='mb-6'>
          <h2 className='text-2xl font-bold mb-2'>6. Changes to Our Privacy Policy</h2>
          <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the updated privacy policy on our website. It is advised that you review this privacy policy periodically for any changes.</p>
        </section>

        <section className='mb-6'>
          <h2 className='text-2xl font-bold mb-2'>7. Contact Us</h2>
          <p>If you have any questions about this privacy policy or our practices, please contact us. Preferred method of contact is by emailing <a href="mailto:michael.poirierginter+wavenet-for-chrome@gmail.com" className='text-blue-600 hover:underline font-bold'>michael.poirierginter+wavenet-for-chrome@gmail.com</a>.</p>
        </section>
      </div>
    </div>
  );
}
