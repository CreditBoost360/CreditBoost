import React from 'react';
import Container from '../Common/Container';

const HowTo = () => {
  return (
    <div id="solution">
      <Container>
        <div className='mb-12 space-y-2 text-center'>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-sky-500 mx-auto">
            <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z" clipRule="evenodd" />
          </svg>
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white md:text-5xl">Our Solution</h2>
          <p className="text-gray-600 dark:text-gray-300">Empowering MSMEs with smart credit solutions</p>
        </div>

        <div className="space-y-6 justify-between text-gray-600 md:flex flex-row-reverse md:gap-6 md:space-y-0 lg:gap-12 lg:items-center">
          <div className="md:w-5/12 lg:w-1/2">
            <img
              src="./images/pie.svg"
              alt="image"
              loading="lazy"
              className="w-full"
            />
          </div>

          <div className="md:w-7/12 lg:w-1/2">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
              Boost your MSME's credit score effortlessly
            </h2>
            <p className="my-8 text-gray-600 dark:text-gray-300">
              Our platform provides MSMEs with tailored credit improvement solutions. We guide you step-by-step in enhancing your business's financial health.
              <br /><br />
              Simply sign up, provide essential business details, and gain access to actionable insights on improving your credit score.
              Our platform also offers continuous support, keeping your business credit healthy.
            </p>

            <div className="divide-y space-y-4 divide-gray-100 dark:divide-gray-800">
              <div className="mt-8 flex gap-4 md:items-center">
                <div className="w-12 h-12 flex gap-4 rounded-full bg-sky-100 dark:bg-sky-900/20">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 m-auto text-sky-500 dark:text-sky-400">
                    <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="w-5/6">
                  <h3 className="font-semibold text-lg text-gray-700 dark:text-sky-300">Expert Advice Anytime</h3>
                  <p className="text-gray-500 dark:text-gray-400">Chat with our AI-powered assistant for personalized credit improvement tips.</p>
                </div>
              </div>

              <div className="pt-4 flex gap-4 md:items-center">
                <div className="w-12 h-12 flex gap-4 rounded-full bg-sky-100 dark:bg-sky-900/20">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 m-auto text-sky-500 dark:text-sky-400">
                    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="w-5/6">
                  <h3 className="font-semibold text-lg text-gray-700 dark:text-sky-300">All-in-One Platform</h3>
                  <p className="text-gray-500 dark:text-gray-400">Find all the resources you need to manage and improve your credit score.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default HowTo;