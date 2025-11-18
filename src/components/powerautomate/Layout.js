import { useState } from "react";
import SupportModal from "./SupportModal";

const Layout = ({ children }) => {
  const [showSupport, setShowSupport] = useState(false);

  return (
    <div>
      {children}

      <SupportModal
        show={showSupport}
        onHide={() => setShowSupport(false)}
        currentPage={window.location.pathname}
      />
    </div>
  );
};

export default Layout;
