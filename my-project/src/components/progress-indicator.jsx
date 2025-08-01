
  
 
  
  export function ProgressIndicator({ steps }) {
    return (
      <div className="w-full">
        <h2 className="text-lg font-semibold mb-4">Battery Passport Progress</h2>
        <div className="relative">
          <div className="absolute left-0 top-[15px] w-full h-0.5 bg-gray-200" />
          <div className="relative flex justify-between">
            {steps.map((step, index) => (
              <div key={step.name} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 
                    ${
                      step.status === 'complete'
                        ? 'bg-green-500 text-white'
                        : step.status === 'current'
                        ? 'bg-blue-500 text-white border-2 border-blue-500'
                        : 'bg-white border-2 border-gray-300'
                    }`}
                >
                  {step.status === 'complete' ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span className="text-sm">{index + 1}</span>
                  )}
                </div>
                <span
                  className={`mt-2 text-sm font-medium 
                    ${
                      step.status === 'complete'
                        ? 'text-green-500'
                        : step.status === 'current'
                        ? 'text-blue-500'
                        : 'text-gray-500'
                    }`}
                >
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  