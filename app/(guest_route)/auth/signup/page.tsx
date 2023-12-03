"use client";

import React from "react";
import AuthFormContainer from "@components/AuthFormContainer";
import { Button, Input } from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useFormik } from "formik";
import Link from "next/link";
import * as yup from 'yup';
import { filterFormikErrors } from "@/app/utils/formikHelpers";
import { toast } from 'react-toastify';
import { signIn } from 'next-auth/react';

const validationSchema = yup.object().shape({
  name: yup.string().required("Name is required").trim(),
  email: yup.string().email("Invalid Email!").required("Email is required").trim(),
  password: yup.string().required("Password is required").trim()
              .min(8, 'Password requires minimum of 8 characters'),
});

export default function SignUp() {

  const {values, handleChange, handleBlur, handleSubmit, isSubmitting, errors, touched } = useFormik({
    initialValues: {name: "", email: "", password: "" },
    validationSchema,
    onSubmit: async (values, action) => {
      action.setSubmitting(true);
      const response = await fetch('/api/users', {
        method: "POST",
        body: JSON.stringify(values),
        headers: {
          "Content-Type": "application/json",
        }
      });
      const { message, error } = await response.json() as { message: string, error: string }

      if(response.ok) {
        toast.success(message)
      }

      if(!response.ok && error) {
        toast.error(error);

        await signIn("credentials", {
          email: values.email,
          password: values.password,
        });
      }
      
      action.setSubmitting(false);
      
    }
  });



  const formErrors: string[] = filterFormikErrors(errors, touched, values);

  const { name, email, password } = values; 

  type valueKeys = keyof typeof values;

  const error = (name: valueKeys) => {
    return errors[name] && touched[name] ? true : false;
  };

  return (
    <AuthFormContainer title="Create New Account" onSubmit={handleSubmit}>
      <Input 
      name="name" 
      label="Name" 
      onBlur={handleBlur} 
      onChange={handleChange} 
      value={name}
      error={error("name")}
      />
      <Input 
      name="email" 
      label="Email" 
      onBlur={handleBlur} 
      onChange={handleChange} 
      value={email} 
      error={error("email")}
      />
      <Input 
      name="password" 
      label="Password" 
      onBlur={handleBlur} 
      type="password" 
      onChange={handleChange} 
      value={password} 
      error={error("password")}
      />
      <Button type="submit" disabled={isSubmitting} className="w-full">
        Sign up
      </Button>

      <div className="flex items-center justify-between">
        <Link href="/auth/signin">Sign in</Link>
        <Link href="/auth/forget-password">Forget password</Link>
      </div>

      <div className="">
        {formErrors.map((err) => {
          return (
            <div key={err} className="space-x-1 flex items-center text-red-500">
              <XMarkIcon className="w-4 h-4" />
              <p className="text-xs">{err}</p>
            </div>
          );
        })}
      </div>
    </AuthFormContainer>
  );
}