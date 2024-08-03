import { TextField } from "@mui/material";
import { useState } from "react";

type EmailInputProps = {
  onNewEmail: (email: string | null) => void;
};
const emailRegex = /\S+@\S+\.\S+/;

const EmailInput = ({ onNewEmail }: EmailInputProps) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailVal = e.target.value;
    const isValid = emailRegex.test(emailVal);

    setEmail(emailVal);
    setError(
      isValid
        ? null
        : emailVal === ""
        ? "email address is required"
        : "Invalid email address"
    );
    onNewEmail(isValid ? emailVal : null);
  };

  return (
    <TextField
      fullWidth
      label="Email address"
      variant="outlined"
      value={email}
      onChange={handleEmailChange}
      margin="normal"
      error={error === null ? false : true}
      helperText={error}
    />
  );
};

export { EmailInput };
