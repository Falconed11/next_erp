import { Button } from "@heroui/react";
import { useState } from "react";

const ConditionalComponent = ({ condition, component }) => {
  return condition ? component : <></>;
};

const AuthorizationComponent = ({ roles, user, component }) => {
  return roles.includes(user.peran) ? component : <></>;
};

const ShowHideComponent = ({
  stat,
  setStat,
  children,
  openContent,
  closeContent,
}) => {
  // stat and setStat must be `const [stat, setStat] = useState(0)`;
  return (
    <div>
      <Button
        color="primary"
        onPress={() => {
          setStat(stat == 0 ? 1 : 0);
        }}
      >
        {stat == 0 ? openContent || "Buka" : closeContent || "Sembunyikan"}
      </Button>
      <div className={`${stat == 0 ? "hidden" : ""}`}>{children}</div>
    </div>
  );
};

export { ConditionalComponent, AuthorizationComponent, ShowHideComponent };
