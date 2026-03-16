import { Button } from "@heroui/react";
import { useState } from "react";
import { RiArrowDropDownLine, RiArrowDropRightLine } from "react-icons/ri";

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
  className,
  btnClassName,
  btnSize,
  variant,
}) => {
  // stat and setStat must be `const [stat, setStat] = useState(0)`;
  return (
    <div>
      <Button
        variant={variant}
        className={btnClassName}
        size={btnSize}
        color="primary"
        onPress={() => {
          setStat(stat == 0 ? 1 : 0);
        }}
      >
        {stat == 0 ? openContent || "Buka" : closeContent || "Sembunyikan"}
      </Button>
      <div
        className={`${stat == 0 ? "max-h-0" : "max-h-1000"} overflow-hidden transition-all duration-500`}
      >
        {children}
      </div>
    </div>
  );
};
const ShowHideComponent2 = ({
  initialState,
  children,
  openContent,
  closeContent,
}) => {
  // stat and setStat must be `const [stat, setStat] = useState(0)`;
  const [isOpen, setIsOpen] = useState(initialState);
  return (
    <div className="flex flex-col gap-2">
      <div>
        <Button
          color="primary"
          onPress={() => {
            setIsOpen(!isOpen);
          }}
        >
          {isOpen ? (
            <>
              {openContent || "Sembunyikan"}
              <RiArrowDropDownLine className="text-4xl" />
            </>
          ) : (
            <>
              {closeContent || "Buka"}
              <RiArrowDropRightLine className="text-4xl" />
            </>
          )}
        </Button>
      </div>
      <div
        className={`${isOpen ? "max-h-1000" : "max-h-0"} overflow-hidden transition-all duration-500`}
      >
        {children}
      </div>
    </div>
  );
};

export {
  ConditionalComponent,
  AuthorizationComponent,
  ShowHideComponent,
  ShowHideComponent2,
};
