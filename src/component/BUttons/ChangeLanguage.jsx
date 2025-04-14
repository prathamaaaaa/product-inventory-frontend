import React, { useState } from "react";
// import { useTranslation } from "react-i18next";
// import i18n from "../component/i18n";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { Globe, ChevronDown } from "lucide-react";



function ChangeLanguage() {



    
      const [isOpen, setIsOpen] = useState(false);
    
      const { t } = useTranslation();
    
      const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setIsOpen(false);
        localStorage.setItem("language", lng);
    
      };
    
    
  return (
    <div>
                  <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center px-3 py-2  text-white rounded-md hover:bg-[#334155] hover:text-white transition"
            >
              <Globe className="w-5 mr-5 h-5" />
              {t("selectLanguage")}
              <ChevronDown className="w-4 ml-2 h-4" />
            </button>

            {isOpen && (
       
           <div className="absolute right-0 mt-2 w-32 shadow-lg rounded-lg overflow-hidden border border-gray-200">
                <button
                  onClick={() => changeLanguage("en")}
                  className="block w-full px-4 py-2 text-left hover:bg-[#334155]"
                >
                  English
                </button>
                
                <button
                  onClick={() => changeLanguage("hi")}
                  className="block w-full px-4 py-2 text-left hover:bg-[#334155]"
                >
                  Hindi
                </button>
                <button
                  onClick={() => changeLanguage("guj")}
                  className="block w-full px-4 py-2 text-left hover:bg-[#334155]"
                >
                  Gujarati
                </button>
              </div>
            )}
    </div>
  )
}

export default ChangeLanguage