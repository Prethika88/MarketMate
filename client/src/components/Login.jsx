import { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import axiosInstance from '../api/axios';
import toast from 'react-hot-toast';

const Login = () => {
    const { setShowUserLogin, setUser,navigate } = useAppContext()
    const [state, setState] = useState("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const api = import.meta.env.VITE_URL_ENDPOINT
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setShowUserLogin(false);
            }

        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const handleGoogleLogin = () => {
        window.location.href = `${api}/user/google`
    }

    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault()

            const { data } = await axiosInstance.post(`/user/${state}`, { name, email, password })
            if (data.success) {
                navigate("/")
                setUser(data.user)
                setShowUserLogin(false)
            }else{
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.response.data.message)
        }


    }

    return (
        <div onClick={() => setShowUserLogin(false)} className="fixed top-0 bottom-0 left-0 right-0 z-30 flex items-center text-sm text-gray-600 bg-black/50">
            <form className="flex flex-col gap-4 m-auto items-start p-8 py-8 w-80 sm:w-[400px] rounded-xl shadow-2xl border border-gray-200 bg-white" onClick={(e) => e.stopPropagation()} onSubmit={onSubmitHandler}>
                <div className="w-full text-center mb-6">
                    <p className="text-2xl font-semibold">
                        <span className="text-primary">User</span> {state === "login" ? "Login" : "Sign Up"}
                    </p>
                </div>

                {/* Botão do Google */}
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <img src={assets.google_logo} alt="Google logo" className='w-5' />
                    <span className="text-gray-700 font-medium">Continue with Google</span>
                </button>

                <div className="w-full flex items-center my-4">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="px-4 text-gray-500 text-sm">or</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {state === "register" && (
                    <div className="w-full">
                        <label className="block text-gray-700 mb-1">Name</label>
                        <input
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                            placeholder="Enter your name"
                            className="border border-gray-300 rounded-lg w-full px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            type="text"
                            required
                        />
                    </div>
                )}

                <div className="w-full">
                    <label className="block text-gray-700 mb-1">Email</label>
                    <input
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        placeholder="Enter your email"
                        className="border border-gray-300 rounded-lg w-full px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        type="email"
                        required
                    />
                </div>

                <div className="w-full">
                    <label className="block text-gray-700 mb-1">Password</label>
                    <input
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        placeholder="Enter your password"
                        className="border border-gray-300 rounded-lg w-full px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        type="password"
                        required
                    />
                </div>

                <div className="w-full text-center text-sm mt-2">
                    {state === "register" ? (
                        <p>
                            Already have an account? {' '}
                            <button
                                type="button"
                                onClick={() => setState("login")}
                                className="text-primary hover:text-primary-dull font-medium cursor-pointer"
                            >
                                Login here
                            </button>
                        </p>
                    ) : (
                        <p>
                            Don't have an account? {' '}
                            <button
                                type="button"
                                onClick={() => setState("register")}
                                className="text-primary hover:text-primary-dull font-medium cursor-pointer"
                            >
                                Create account
                            </button>
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    className="bg-primary hover:bg-primary-dull transition-colors text-white font-medium w-full py-2.5 rounded-lg cursor-pointer mt-4"
                >
                    {state === "register" ? "Create Account" : "Sign In"}
                </button>
            </form>
        </div>
    );
}

export default Login;