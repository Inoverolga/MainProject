import { useTranslation } from "react-i18next";

const Spinner = () => {
  const { t } = useTranslation();

  return (
    <div className="d-flex justify-content-center mt-5">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">{t("loading")}</span>
      </div>
    </div>
  );
};
export default Spinner;
