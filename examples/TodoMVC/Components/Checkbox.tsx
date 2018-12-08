import React from "react";
import { action } from "mobx";

export const Checkbox = ({ model, name, ...props }) => (
  <input
    type="checkbox"
    checked={model[name]}
    onChange={action(e => {
      // @ts-ignore
      model[name] = !!e.target.checked;
    })}
    {...props}
  />
);
