import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button(props: any) {
  return (
    <button
      {...props}
      className="border rounded px-3 py-2 bg-white hover:bg-blue-500 hover:text-white transition-colors duration-200"
    >
      {props.children}
    </button>
  );
}
