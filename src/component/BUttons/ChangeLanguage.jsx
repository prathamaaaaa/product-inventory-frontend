import React, { useEffect, useState } from "react";
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
    <div className="">
                  <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center px-3 py-2   transition"
            >
              <Globe className="w-5 mr-2 h-5" />
              {t("selectLanguage")}
              <ChevronDown className="w-4 ml-2 h-4" />
            </button>

            {isOpen && (
       
           <div className="absolute right-0 mt-2 w-32 shadow-lg rounded-lg text-black overflow-hidden border border-gray-200">
                <button
                  onClick={() => changeLanguage("en")}
                  className="block w-full text-black px-4 py-2 text-left hover:bg-[#B03052]  hover:text-white"
                >
                  English
                </button>
                
                <button
                  onClick={() => changeLanguage("hi")}
                  className="block w-full text-black px-4 py-2 text-left hover:bg-[#B03052]  hover:text-white"
                >
                  Hindi
                </button>
                <button
                  onClick={() => changeLanguage("guj")}
                  className="block w-full text-black px-4 py-2 text-left hover:bg-[#B03052]  hover:text-white"
                >
                  Gujarati
                </button>
              </div>
            )}
    </div>
  )
}

export default ChangeLanguage