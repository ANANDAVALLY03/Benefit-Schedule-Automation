import * as Yup from "yup";

export const loginValidationSchema = Yup.object({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email address is required"),

  password: Yup.string()
    .min(6, "Password must contain at least 6 characters")
    .required("Password is required"),
});