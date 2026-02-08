import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { fetchAuth, fetchReg } from "../api/auth"
import { useNavigate } from "react-router-dom"

type AuthMode = "login" | "registration"

export const useAuth = (mode: AuthMode) => {
    const [login, setLogin] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [loginErr, setLoginErr] = useState('')
    const [emailErr, setEmailErr] = useState('')
    const [passwordErr, setPasswordErr] = useState('')
    const [confirmPasswordErr, setConfirmPasswordErr] = useState('')

    const navigate = useNavigate()

    const authMutation = useMutation({
        mutationFn: ({ email, login, password }: {
            email: string,
            login: string,
            password: string
        }) => mode === "login" ?
                fetchAuth(
                    login,
                    password
                ) :
                fetchReg(
                    login,
                    email,
                    password)
        ,
        onSuccess: () => {
            navigate('/main');
        },
        onError: (e) => {
            setPasswordErr(e.message)
        }
    })

    const validateData = () => {
        setLoginErr('');
        setPasswordErr('');
        setConfirmPasswordErr('');
        if (login === '') {
            setLoginErr('Введите логин.')
            // loginRef.current?.focus()
            return false;
        }
        if (password === '') {
            setPasswordErr('Введите пароль.')
            // passwordRef.current?.focus()
            return false;
        }
        if (mode != 'login') {
            if (!email) {
                setEmailErr("введите емейл")
            }
            if (confirmPassword === '') {
                setConfirmPasswordErr('Повторите пароль.')
                // password2Ref.current?.focus()
                return false;
            }
            if (password !== confirmPassword) {
                setConfirmPasswordErr('Пароли не совпадают.')
                return false;
            }
        }
        return true;
    }

    const handleSubmit = () => {
        if (!validateData()) return;

        authMutation.mutate({
            email,
            login,
            password
        });
    };


    return {
        login,
        setLogin,
        email,
        setEmail,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        loginErr,
        emailErr,
        passwordErr,
        confirmPasswordErr,
        handleSubmit
    }

}
