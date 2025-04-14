// components/DownloadCSVButton.jsx
import React from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

const DownloadCSVButton = ({ storeId, BASE_URL }) => {
  const { t } = useTranslation();

  const handleDownloadCSV = () => {
    axios
      .get(`${BASE_URL}/api/stores/download-csv/${storeId}`, {
        responseType: "blob",
      })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `store_${storeId}_products.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        Swal.fire("Success!", t("csvDownloaded"), "success");
      })
      .catch((error) => {
        console.error("Error downloading CSV:", error);
        Swal.fire("Error!", t("csvDownloadFailed"), "error");
      });
  };

  return (
    <button
      onClick={handleDownloadCSV}
      className="mt-4 bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 w-full"
    >
      {t("downloadCSV")}
    </button>
  );
};

export default DownloadCSVButton;
