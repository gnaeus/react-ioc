import React from "react";
import { action } from "mobx";

export const Input = ({ model, name, ...props }) => (
  <input
    type="text"
    value={model[name]}
    onInput={action(e => {
      // @ts-ignore
      model[name] = e.target.value;
    })}
    {...props}
  />
);
