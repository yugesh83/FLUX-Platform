export default function CheckEmail() {
    return (
      <div className="min-h-screen bg-gray-50 grid place-items-center">
        <div className="bg-white p-8 rounded-lg shadow-sm text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Check Your Email</h1>
          <p className="mb-6">
            We've sent a verification link to your email address.
            Please verify your email to continue.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            I've Verified My Email
          </button>
        </div>
      </div>
    );
  }