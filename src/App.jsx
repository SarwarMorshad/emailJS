import "./App.css";

function App() {
  return (
    <>
      <h1>Vite + React</h1>
      <div className="max-w-11/12 mx-auto flex flex-col items-center gap-4">
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
          <legend className="fieldset-legend">Login</legend>

          <label className="label">Email</label>
          <input type="email" className="input" placeholder="Email" />

          <label className="label">Password</label>
          <input type="password" className="input" placeholder="Password" />

          <button className="btn btn-neutral mt-4">Login</button>
        </fieldset>
      </div>
    </>
  );
}

export default App;
