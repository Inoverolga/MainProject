import { useState } from "react";
import { Button } from "react-bootstrap";
import SupportModal from "./SupportModal";

const Layout = ({ children }) => {
  const [showSupport, setShowSupport] = useState(false);

  return (
    <div>
      {children}
      <div className="position-fixed bottom-0 end-0 m-3">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => setShowSupport(true)}
          className="d-flex align-items-center gap-2"
        >
          <span>!</span>
          Справка
        </Button>
      </div>

      <SupportModal
        show={showSupport}
        onHide={() => setShowSupport(false)}
        currentPage={window.location.pathname}
      />
    </div>
  );
};

export default Layout;
