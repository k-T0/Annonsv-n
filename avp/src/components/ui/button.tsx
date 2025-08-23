import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, className = "", ...rest }) => {
  return (
    <button {...rest} className={`px-4 py-2 rounded-full font-semibold ${className}`}>
      {children}
    </button>
  );
};

export default Button;
