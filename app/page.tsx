export default function Home() {
  return (
    <main className="min-h-screen bg-[#121212]">
      <div className="container mx-auto px-4 py-8 h-screen flex flex-col space-y-8">
        {/* Header Section */}
        <header className="text-center animate-fade-in-up">
          <div className="mb-4 flex items-center justify-center gap-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              AI Full Stack Kitchen
            </h1>
            <div className="h-8 w-[1px] bg-gray-700/30"></div>
            <p className="text-gray-500/80 text-base font-light tracking-wide">
              Use templates • Build fast • Ship today
            </p>
            <div className="h-8 w-[1px] bg-gray-700/30"></div>
            <a
              href="/sign-up"
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-medium hover:opacity-90 transition-opacity"
            >
              GET STARTED
            </a>
          </div>
        </header>

        {/* Demo Chat Interface */}
        <div className="flex-1 flex rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl bg-[#1a1a1a]/80">
          {/* Template Sidebar */}
          <div className="rounded-l-3xl w-64 border-r border-white/5 bg-[#1a1a1a] p-4 overflow-y-auto">
            <div className="space-y-6">
              <div className="mb-8">
                <div className="w-full py-3 rounded-xl bg-[#1a1a1a] border border-gray-700/50">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                    Design Mode Inactive
                  </span>
                </div>
              </div>

              {/* Demo Templates */}
              {['Authentication', 'Payments', 'Database', 'Environment'].map((category, idx) => (
                <div key={idx} className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-400/80 uppercase tracking-wider">
                    {category}
                  </h3>
                  {[1, 2].map((item) => (
                    <div
                      key={item}
                      className="w-full p-3 text-left text-sm rounded-xl bg-[#1a1a1a]/30 border border-gray-700/30"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-200">Template {item}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="rounded-3xl flex-1 flex flex-col">
            {/* Model Selection */}
            <div className="border-b border-white/5 p-4 bg-[#1a1a1a]">
              <div className="bg-[#1a1a1a]/40 text-gray-200 px-4 py-2.5 rounded-xl border border-white/5">
                🧠 DeepSeek Reasoner
              </div>
            </div>

            {/* Demo Messages */}
            <div className="bg-[#1a1a1a] flex-1 overflow-y-auto p-4 space-y-4">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="max-w-[85%] bg-gradient-to-br from-sky-600/10 to-emerald-700/20 text-cyan-100 border border-cyan-700/30 rounded-3xl p-4">
                  How to create a Stripe checkout session?
                </div>
              </div>

              {/* AI Response */}
              <div className="flex justify-start">
                <div className="max-w-[85%] bg-[#1a1a1a]/10 border border-white/5 rounded-3xl backdrop-blur-sm p-4">
                  <div className="prose prose-invert max-w-full break-words">
                    Here's a TypeScript implementation for a Stripe checkout session:
                    <pre className="!bg-[#1a1a1a] rounded-md p-4 mt-2">
                      {`const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price_data: {
      currency: 'usd',
      product_data: { name: 'Premium Plan' },
      unit_amount: 2000,
    },
    quantity: 1,
  }],
  mode: 'payment',
  success_url: \`\${domain}/success\`,
  cancel_url: \`\${domain}/cancel\`,
});`}
                    </pre>
                  </div>
                  <button className="absolute top-2 right-2 p-1.5 bg-white/10 rounded-md">
                    <svg className="h-4 w-4 text-gray-300" /* Copy icon */ />
                  </button>
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-white/5 p-4 bg-[#1a1a1a]">
              <div className="flex items-end gap-3">
                <textarea
                  rows={1}
                  className="flex-1 p-3.5 bg-gradient-to-t from-[#1a1a1a] via-[#232323] to-[#2a2a2a] text-white/90 rounded-xl resize-none"
                  placeholder="Type your message here..."
                />
                <button 
                  className="p-3 bg-white/30 text-white rounded-xl"
                  disabled
                >
                  <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        viewBox="0 0 20 20" 
                                        fill="currentColor" 
                                        className="w-6 h-6"
                                    >
                                        <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                                    </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-gray-800/50">
          <p className="text-sm text-gray-500/80 font-light">
            Secured by Advanced Encryption • Powered by DeepSeek R1
          </p>
        </footer>
      </div>
    </main>
  );
}