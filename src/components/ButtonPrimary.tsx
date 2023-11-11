import { JsxButtonProps } from "../types/jsx";

type ButtonPrimaryType = {
  classs?: string;
  name?: string;
  disabled?: boolean;
} & JsxButtonProps;

export default function ButtonPrimary({
  classs,
  name,
  disabled,
  ...rest
}: ButtonPrimaryType) {
  return (
    <button
      {...rest}
      disabled={disabled}
      className={`btn btn-primary ${classs}`}
    >
      {name}
    </button>
  );
}
