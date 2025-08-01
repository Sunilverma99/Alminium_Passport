import { Loader2 } from "lucide-react"



export default function LoadingState({ isDataFetched }) {
  if (!isDataFetched) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-xl p-8 w-full max-w-md border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-700 [mask-image:linear-gradient(to_bottom,white,rgba(255,255,255,0.6))]"></div>

          <div className="relative">
            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 opacity-75 blur-sm animate-pulse"></div>
                <div className="relative bg-white dark:bg-slate-800 rounded-full p-3">
                  <Loader2 className="h-10 w-10 text-blue-600 dark:text-blue-400 animate-spin" />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-center mb-2 text-slate-800 dark:text-slate-100">
                Fetching Battery Data
              </h1>

              <p className="text-slate-500 dark:text-slate-400 text-center mb-4">
                Please wait while we retrieve the latest information
              </p>

              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-4 overflow-hidden">
                <div className="bg-blue-600 h-2 rounded-full animate-progress"></div>
              </div>

              <div className="text-sm text-slate-400 dark:text-slate-500">This may take a few moments...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  
  return null
}

