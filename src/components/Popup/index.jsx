import React, { useState, useEffect } from "react";
import { render } from "react-dom";

import hmacSHA256 from "crypto-js/hmac-sha512";
import Base64 from "crypto-js/enc-base64";

import "./index.scss";

const Popup = () => {
  const [state, setState] = useState({
    formInputs: {
      email: "",
      passphrase: "",
    },
    currentUrl: "",
    password: "",
    dark: false,
  });

  useEffect(() => {
    // Get user data (dark mode)
    chrome.storage.sync.get(["dark"], function (result) {
      setState({ ...state, dark: result.dark });
    });

    // Get current url
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (tabs[0]) {
        let currentUrl = tabs[0].url;

        // Hack to only get the host property of the URL
        const urlHack = document.createElement("a");
        urlHack.href = currentUrl;
        currentUrl = urlHack.host;

        setState({ ...state, currentUrl });
      }
    });
  }, []);

  const handleSwitch = () => {
    chrome.storage.sync.set({ dark: !state.dark }, function () {
      setState({ ...state, dark: !state.dark });
      chrome.storage.sync.get(["dark"], function (result) {
        console.log(result);
      });
    });
  };

  const handleInputChange = (inputName) => (event) => {
    setState({
      ...state,
      formInputs: {
        ...state.formInputs,
        [inputName]: event.target.value,
      },
    });
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    generatePassword();
  };

  const generatePassword = () => {
    // Generate password
    let password = Base64.stringify(
      hmacSHA256(state.currentUrl + state.formInputs.email, state.formInputs.passphrase)
    ).substring(0, 12);

    // Check for special characters
    const format = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    if (!format.test(password)) {
      password += "@";
    }

    setState({ ...state, password });
  };

  return (
    <div className={`popup ${state.dark ? "dark" : "light"}`}>
      <div className="popup__header">
        {state.currentUrl}
        <div className="popup__avatar">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="128"
            width="128"
            viewBox="0 0 512 512"
          >
            <path
              d="m111 504s-10.30188-90.311127 78.440002-100.386658h37.973328v-17.493347s26.71167 11.473328 53.76001 1.279999c0 0 .853332 16.213348.853332 16.213348h44.373322s77.273468 7.714264 72.600006 100.386658z"
              fill="#fff"
            />
            <g fill="#3b434f">
              <path d="m398.261932 505.58667h-284.516388-5.517883s1.37735-23.529816 1.37735-23.529816c2.689301-45.94223 38.886871-81.003509 80.309998-81.003509h37.498321v4.693329h-34.983612c-39.92337 0-74.810394 33.748413-77.402344 77.970336 0 0-.956726 16.322999-.956726 16.322999h283.439514s-.530059-16.322999-.530059-16.322999c-2.59195-44.221923-37.478974-77.970336-77.402375-77.970336h-35.417724v-4.693329h37.679413c41.423126 0 77.620697 35.061279 80.309997 81.003509 0 0 1.37735 23.529816 1.37735 23.529816z" />
              <path d="m230.399994 384.146088v26.315094c0 13.655487 11.079468 24.725494 24.746673 24.725494 13.667206 0 24.746674-11.070007 24.746674-24.725494v-25.772187c1.436157-.437133 2.858795-.911926 4.266663-1.424865v27.376159c0 16.148621-13.085205 29.239716-29.226654 29.239716s-29.226685-13.091095-29.226685-29.239716v-28.186615c1.545837.611237 3.111542 1.173432 4.693329 1.692414z" />
              <path d="m331.71994 457.489349s-12.085357 25.20691-12.085357 25.20691c-.611237 1.274902-2.140259 1.812896-3.415131 1.20166-1.274902-.611237-1.812897-2.140259-1.20166-3.415161 0 0 11.672027-24.344758 11.672027-24.344758s-9.120178-15.7966-9.120178-15.7966c-.706909-1.224426-.287414-2.7901.937012-3.497009 1.224457-.70694 2.7901-.287415 3.49704.937012 0 0 9.813324 16.997192 9.813324 16.997192.505706.875885.432373 1.924896-.097077 2.710754z" />
              <path d="m178.362396 457.513947s12.150208 25.284515 12.150208 25.284515c.614502 1.278839 2.151733 1.818481 3.433441 1.205353 1.281738-.613129 1.822632-2.146851 1.208099-3.425659 0 0-11.734619-24.419709-11.734619-24.419709s9.169098-15.845245 9.169098-15.845245c.710693-1.22818.28894-2.798676-.942047-3.507782-1.231018-.709107-2.805054-.2883-3.515778.939911 0 0-9.865966 17.04953-9.865966 17.04953-.508423.87857-.434723 1.930816.097564 2.719086z" />
              <path d="m225.706665 400.200012h4.693329v103.679993h-4.693329z" />
              <path d="m279.893341 401.053345h4.693329v103.679992h-4.693329z" />
            </g>
            <path
              d="m256.214661 116.466644c53.077881 0 94.97229 49.601227 93.610077 109.198304 0 0-1.447815 63.341156-1.447815 63.341156-1.283326 56.146362-42.531495 100.527221-92.162262 100.527221-49.630768 0-90.878937-44.380859-92.162262-100.527221 0 0-1.447815-63.341156-1.447815-63.341156-1.362183-59.597077 40.532196-109.198304 93.610077-109.198304z"
              fill="#fff"
            />
            <path
              d="m354.089386 223.701141s-1.517059 65.914368-1.517059 65.914368c-1.344696 58.427307-44.56604 104.611145-96.570923 104.611145-52.004914 0-95.226227-46.183838-96.570954-104.611145 0 0-1.517089-65.914368-1.517089-65.914368-1.427338-62.018219 42.47113-113.634491 98.088043-113.634491s99.51535 51.616272 98.087982 113.634491zm-98.301086-106.80783c-52.352265 0-93.67392 49.213714-92.330384 108.345184 0 0 1.42804 62.846313 1.42804 62.846313 1.265777 55.707703 41.950073 99.741852 90.902344 99.741852 48.95227 0 89.636535-44.034149 90.902313-99.741852 0 0 1.428009-62.846313 1.428009-62.846313 1.343597-59.13147-39.978058-108.345184-92.330322-108.345184z"
              fill="#3b434f"
            />
            <path
              d="m351.426666 234.65332s-4.266662 69.973358-4.266662 69.973358-18.950226 80.770936-92.160004 90.334687v.118622c-.14389-.017579-.283203-.041169-.426666-.059296-.143463.018127-.282776.041717-.426667.059296v-.118622c-73.209747-9.563751-92.160003-90.334687-92.160003-90.334687s-4.266663-69.973358-4.266663-69.973358c18.997772 84.326691 34.986664 89.600037 34.986664 89.600037-3.235565-25.571137 23.040009-23.040009 23.040009-23.040009 16.014129 2.705079 28.762481 4.012268 38.82666 4.500977 10.064209-.488709 22.81253-1.795898 38.82666-4.500977 0 0 26.275543-2.531128 23.040008 23.040009 0 0 15.988892-5.273346 34.986664-89.600037zm-47.443573 98.273072c-1.242035-15.041626-10.312225-13.766175-10.312225-13.766175-16.124634 4.744629-28.782135 7.380432-38.670868 8.720032v-.098328c-9.819489-1.328674-22.388336-3.94284-38.399994-8.64859 0 0-9.006683-1.265014-10.240021 13.653351 0 0-3.616668 14.946655 8.533356 21.333313 0 0 15.359985 16.213349 15.359985 16.213349s10.496674 3.32666 10.240021-9.386689c0 0-1.068359-9.481659 5.119995-11.093322h9.386658v.280761h9.452881c6.231994 1.625 5.156128 11.185028 5.156128 11.185028-.258484 12.818421 10.312195 9.464234 10.312195 9.464234s15.468353-16.347321 15.468353-16.347321c12.235718-6.439453 8.593536-21.509643 8.593536-21.509643z"
              fill="#3b434f"
              opacity=".058824"
            />
            <path
              d="m245.76001 355.826691h20.47998c.942597 0 1.706665.764068 1.706665 1.706634 0 .942597-.764068 1.706665-1.706665 1.706665h-20.47998c-.942597 0-1.706665-.764068-1.706665-1.706665 0-.942566.764068-1.706634 1.706665-1.706634z"
              fill="#3b434f"
            />
            <path
              d="m227.838165 335.406464s2.376496-3.326599 2.376496-3.326599c7.640197 4.370147 16.717132 6.903686 26.455261 6.903686 9.846619 0 19.016601-2.591217 26.709473-7.051392 0 0 2.48822 3.436066 2.48822 3.436066-8.368683 4.844635-18.340576 7.658478-29.047211 7.658478-10.678741 0-20.626984-2.798706-28.982239-7.620239z"
              fill="#3b434f"
            />
            <path
              d="m157.80722 233.313141c-.011779.000671-1.047607-.826538-3.003601-1.442383-.9776-.307251-2.192596-.559998-3.577453-.622314-.345856-.015564-.701813-.019257-1.06604-.008912-.364228.010346-.736756.034699-1.115418.075135-.757232.080902-1.539306.226288-2.326294.452667-3.151153.905579-6.365722 3.10733-8.253631 7.651764-.947693 2.272339-1.572876 5.130615-1.738159 8.706818-.041352.894073-.053986 1.833007-.035859 2.818878.018158.98587.067109 2.018676.148865 3.100494.163422 2.163544.458527 4.523163.898224 7.094391-.009613-.002533-.410095 7.769989 2.368591 16.701141 2.612244 8.731964 8.885071 19.458405 20.466889 22.52359-1.332032-22.179382-1.373413-44.774505-2.766114-67.051269z"
              fill="#f7fbfb"
            />
            <path
              d="m159.127869 234.207275s-20.176392-6.251678-19.466339 14.490815c0 0 3.003906 30.07727 4.308349 32.849273 0 0 7.923828 17.512024 21.000977 18.288117 12.781006.758514 0 0 0 0s.158722 5.644531.158722 5.644531-22.98465-2.946991-27.423981-29.434601c0 0-3.503876-24.062713-3.503876-24.062713s-2.720611-31.844635 23.669464-23.747895c25.70929 7.887879 0 0 0 0s1.256684 5.972473 1.256684 5.972473"
              fill="#3b434f"
            />
            <path
              d="m152.468323 275.994812s-1.129151.853333-2.099152.853333-2.085388-.853333-2.085388-.853333-2.082214-20.982788-2.082214-20.982788 2.872924-10.333466 15.063812-4.872528c0 0 .288177 5.999725.288177 5.999725s-10.695648-3.793213-10.474487.930206c.212891 4.54654 1.389252 18.925385 1.389252 18.925385z"
              fill="#3b434f"
            />
            <path
              d="m353.813416 233.362122c.01184.000671 1.052215-.825959 3.016754-1.441407.981903-.307037 2.202209-.5596 3.593139-.621887.347351-.015533.704865-.019226 1.07071-.00888.365814.010314.739959.034667 1.1203.075073.760528.080841 1.546051.226135 2.336487.452362 3.164947.904968 6.393585 3.105224 8.289764 7.646576.951843 2.270782 1.579773 5.127105 1.745758 8.700897.041535.893463.05423 1.831757.036041 2.816956-.018249.985198-.067413 2.017303-.149536 3.098388-.164123 2.162079-.460541 4.520111-.90216 7.089569.009674-.002533.411895 7.76474-2.378968 16.68982-2.623657 8.726043-8.92398 19.44519-20.556518 22.5083 1.33786-22.164337 1.379425-44.74411 2.778229-67.005767z"
              fill="#f7fbfb"
            />
            <path
              d="m352.482605 234.255676s20.26477-6.247436 19.551605 14.480957c0 0-3.017059 30.056855-4.32724 32.826966 0 0-7.958526 17.500152-21.092926 18.275726-12.837005.757996 0 0 0 0s-.159424 5.640686-.159424 5.640686 23.085297-2.944977 27.544068-29.414612c0 0 3.519226-24.046387 3.519226-24.046387s2.732544-31.823028-23.773133-23.731781c-25.821868 7.882538 0 0 0 0s-1.262176 5.968445-1.262176 5.968445"
              fill="#3b434f"
            />
            <path
              d="m359.171326 276.014832s1.134094.852752 2.108337.852752 2.094513-.852752 2.094513-.852752 2.091339-20.968537 2.091339-20.968537-2.885498-10.326446-15.129791-4.869232c0 0-.289429 5.995666-.289429 5.995666s10.742493-3.790649 10.520355.929566c-.213806 4.543457-1.395324 18.912537-1.395324 18.912537z"
              fill="#3b434f"
            />
            <path
              d="m263.893341 274.333344h1.493317c3.087463 4.192962 4.343567 10.636413 5.973327 16.213317.505066 1.728302.015076 4.751313-.426666 5.973328-1.617767 4.475525-6.697632 4.395203-10.879974 6.399994-1.12323.538452-1.958741 1.467834-3.41333 1.706695-.948304-.835327-2.093293-.999389-2.560028-2.346679-1.152314-1.586731.332824-2.577606 1.493347-3.200012 2.106231-1.129578 8.608154-2.24289 9.386657-4.266663.963227-1.095734.322754-4.390167 0-5.546661-.826599-2.962159-1.223358-5.43512-2.346649-8.106659-.746154-1.774506-2.056183-3.645508-1.279998-5.76001.643188-.276184 2.033294-.59021 2.559997-1.06665z"
              fill="#3b434f"
            />
            <path
              d="m209.066681 238.066681c4.712829 0 8.533325 3.820496 8.533325 8.533325 0 4.71283-3.820496 8.533325-8.533325 8.533325-4.71283 0-8.533356-3.820495-8.533356-8.533325 0-4.712829 3.820526-8.533325 8.533356-8.533325z"
              fill="#3b434f"
            />
            <path
              d="m303.786652 238.066681c4.712829 0 8.533325 3.820496 8.533325 8.533325 0 4.71283-3.820496 8.533325-8.533325 8.533325-4.712799 0-8.533326-3.820495-8.533326-8.533325 0-4.712829 3.820527-8.533325 8.533326-8.533325z"
              fill="#3b434f"
            />
            <path
              d="m307.626678 269.640015c5.891022 0 10.666657 4.775634 10.666657 10.666656s-4.775635 10.666657-10.666657 10.666657c-5.891052 0-10.666656-4.775635-10.666656-10.666657s4.775604-10.666656 10.666656-10.666656z"
              fill="#edf1f1"
            />
            <path
              d="m204.373352 269.640015c5.891022 0 10.666657 4.775634 10.666657 10.666656s-4.775635 10.666657-10.666657 10.666657c-5.891052 0-10.666656-4.775635-10.666656-10.666657s4.775604-10.666656 10.666656-10.666656z"
              fill="#edf1f1"
            />
            <path
              d="m341.333344 230.386658v31.573333c0 7.715729-7.526429 19.755463-19.790497 20.444947-1.801606-.085907-38.236176.035064-38.236176.035064-16.378326 0-19.626678-19.626678-19.626678-19.626678v-21.333313h-15.359986v21.333313s-3.248352 19.626678-19.626678 19.626678c0 0-36.43457-.120971-38.236176-.035064-12.264068-.689484-19.790497-12.729218-19.790497-20.444947v-31.573333h-13.65332v-8.533325h79.359986s11.946685 1.929992 11.946685 10.23999h15.359986c0-8.309998 11.946685-10.23999 11.946685-10.23999h79.359986v8.533325zm-101.546692 4.266662c0-3.041656-3.41333-3.41333-3.41333-3.41333h-57.17331v29.866669c0 9.305847 12.799988 12.800018 12.799988 12.800018h34.986664c12.037506 0 12.799988-12.800018 12.799988-12.800018s0-23.411652 0-26.453339zm93.013336-3.41333h-57.17331s-3.41333.371674-3.41333 3.41333v26.453339s.762482 12.800018 12.799988 12.800018h34.986664s12.799988-3.494171 12.799988-12.800018zm-11.946655 51.200012c.232635-.004852.460144-.022155.689514-.035064.192871.009216-.000885.020721-.689514.035064zm-130.39618-.035064c.22937.012909.456879.030212.689514.035064-.688629-.014343-.882385-.025848-.689514-.035064z"
              fill="#3b434f"
            />
            <path
              d="m160.750946 229.533356s3.292145-51.396698 35.009705-74.240021c0 0 45.796844 31.15332 117.837646 0 0 0 31.864319 14.513336 36.717529 74.240021h1.710572s9.123199-68.413361-14.519043-95.573365c0 0-5.823822-20.799987-36.717499-35.839996 0 0-11.100647 6.826691-11.100647 6.826691s-7.458252-9.126709-27.324677-20.480011c0 0-14.693023 6.546661-22.201293 17.919983 0 0-11.954529-7.679993-11.954529-7.679993s-16.704346 7.646668-26.470764 21.333344c0 0-17.931824 2.559967-17.931824 2.559967s-9.392853 17.06668-9.392853 17.06668-22.420929 18.063324-15.372925 92.160004c0 0 1.710602 1.706696 1.710602 1.706696z"
              fill="#9ea0a4"
            />
            <path
              d="m355.439728 229.533356s-8.110565-.426667-8.110565-.426667c-4.853211-59.726684-33.730866-70.400024-33.730866-70.400024-72.040802 31.15332-117.837646-.426666-117.837646-.426666-27.703125 23.633331-32.023041 71.680023-32.023041 71.680023s-7.257263-2.133362-7.257263-2.133362c-7.048004-74.09668 15.372924-93.440002 15.372924-93.440002s10.246186-18.773346 10.246186-18.773346 18.785156-2.559967 18.785156-2.559967c9.766418-13.686676 27.750763-22.186676 27.750763-22.186676s11.151306 7.253326 11.151306 7.253326c7.50827-11.373321 23.039978-17.06665 23.039978-17.06665 19.866425 11.353302 27.306671 20.053314 27.306671 20.053314s11.509857-6.399994 11.509857-6.399994c30.893677 15.040009 39.277497 38.82666 39.277497 38.82666 23.642242 27.160004 14.519043 96.000031 14.519043 96.000031zm-20.079712-94.293366s-3.666351-18.666656-34.560028-33.706665c0 0-11.519989 6.82666-11.519989 6.82666s-7.440247-9.126678-27.306671-20.47998c0 0-13.398377 6.973328-20.906647 18.346649 0 0-12.800018-8.106659-12.800018-8.106659s-15.406922 7.220001-25.17334 20.906677c0 0-17.066651 2.559998-17.066651 2.559998s-8.959991 16.213318-8.959991 16.213318-18.61023 14.214447-16.640015 71.680023c0 0 .426667-.426666.426667-.426666s5.920867-35.721131 34.907318-57.600006c0 0 47.076843 32.006652 119.117645.853332 0 0 26.615173 12.516632 35.841705 57.17334 0 0 5.476685-45.931122-15.359985-74.240021z"
              fill="#3b434f"
            />
            <path
              d="m243 451s12-13 12-13 13 13 13 13-7 7-7 7 11 45 11 45h-34s12-45 12-45-7-7-7-7z"
              fill="#3b434f"
            />
            <path
              d="m269.69928 503.689667s-12.093964-45.135254-12.093964-45.135254 2.514679-.754425 2.514679-.754425 1.667389-1.771576 1.667389-1.771576 12.791229 47.737488 12.791229 47.737488-4.879333-.076233-4.879333-.076233zm-34.114289-.53302s12.62613-46.909027 12.62613-46.909027.815551.699035.815551.699035 2.559998 1.706665 2.559998 1.706665.844055.084412.844055.084412-11.976318 44.494995-11.976318 44.494995-4.869416-.07608-4.869416-.07608z"
              fill="#3b434f"
            />
            <path
              d="m284.145569 463.78775s-3.318695 3.318695-3.318695 3.318695-12.913269-12.913269-12.913269-12.913269c-2.491913 3.957825-6.891175 6.593476-11.913605 6.593476-5.225372 0-9.775848-2.852692-12.204926-7.079926 0 0-13.479705 13.479736-13.479705 13.479736s-3.327607-3.327606-3.327607-3.327606 26.538849-26.538849 26.538849-26.538849 2.075592-1.924438 2.075592-1.924438 2.075592 1.924438 2.075592 1.924438 26.467774 26.467743 26.467774 26.467743zm-37.740021-12.691498c1.701477 3.464417 5.26062 5.850403 9.381104 5.850403 4.027832 0 7.514221-2.283203 9.258911-5.621521 0 0-9.434448-9.434448-9.434448-9.434448s-9.205567 9.205566-9.205567 9.205566z"
              fill="#3b434f"
            />
            <path
              d="m257.13913 103.673004c.627746.46698.316986.899109.180664 1.483032-.203369.871155-.444641 1.733429-.580536 2.602723-.205963 1.31723-.393738 2.636016-.447632 3.935577-.045319 1.092773-.025665 2.181946-.006683 3.26413.010955.624939.11792 1.248809.1333 1.874755.006134.249726.074158.500184.081177.754334.01532.06897.03064.13797.04596.206909.008911.319428.092651.624115.101471.942932.052093.288666.104248.577393.156341.866059.07666.457458.113922.934997.253845 1.380615.015351.114105.030701.228271.046051.342377.111023.354126.14737.719635.259095 1.07489.007995.07016.015991.14035.023986.21054.16214.512207.235169 1.051117.396851 1.560151.262543.826568.476166 1.656646.765747 2.481353.192047.546967.357605 1.119965.550812 1.670136.343902.97937.76358 1.935882 1.141571 2.904602.230102.589691.538818 1.134521.785309 1.721649.697571 1.66156 1.593902 3.294617 2.451019 4.923309.276917.526184.580872 1.010102.887756 1.524018.195771.327911.399048.695343.579621 1.033081.099914.186889.225097.327789.33377.509277.235596.393402.490845.816254.722657 1.212616.214386.366547.456421.679566.693207 1.036865.255188.385102.507904.818543.766601 1.205353.449555.672211.926392 1.321838 1.371674 1.985809.462616.689789.982635 1.300507 1.472442 1.980439.94925 1.317657 2.058808 2.581726 3.082215 3.904236.306335.395843.672821.741943.979034 1.125.152741.191101.408112.358062.511505.558868.042084.081757.066132.207764.095459.300323.047211.148957.035004.332917.037018.490662.003204.252533.015503.508331-.028717.772553-.045837.273773-.219696.575103-.332733.845458-.09079.217011-.316864.408326-.444763.513978-.107636.088958-.152039.171691-.26175.257873-.285431.224304-.608429.408783-.92099.502564-.324005.097198-.742767-.193787-.998718-.500763-.447723-.537018-1.007629-1.03003-1.437317-1.568482-.091858-.115143-.193908-.166229-.284149-.280395-.496094-.627564-1.105072-1.218506-1.595032-1.835907-.111847-.14093-.234405-.219941-.342834-.360993-.380921-.495483-.82724-.942047-1.213745-1.447448-.968903-1.266877-2.013703-2.490967-2.889771-3.766755-.204834-.298278-.424652-.533844-.625274-.833557-1.418976-2.120086-2.842865-4.20346-3.979828-6.363769-.299195-.568451-.629822-1.085388-.909821-1.655823-.794952-1.619629-1.536438-3.238251-2.216522-4.871857-.089356-.21463-.154205-.45462-.236786-.672088-.372467-.980652-.709991-1.949067-1.044525-2.931977-.337494-.991546-.529511-2.027435-.84491-3.021484-.066528-.209656-.086822-.437042-.154388-.651886-.009217-.077515-.018433-.155029-.027649-.232513-.073151-.233124-.081146-.480957-.152588-.708649-.171265-.546082-.224213-1.136231-.318176-1.697357-.088684-.529602-.209839-1.071198-.224701-1.611267-.020233-.098236-.040467-.196534-.060669-.2948-.009705-.3508-.098328-.69751-.107056-1.043579-.015198-.604065-.111023-1.206177-.122253-1.808869-.013977-.749481-.042816-1.501678-.038361-2.2518.004486-.751007.066712-1.485138.110047-2.242523.11737-2.051728.492584-4.113343.988098-6.238068.179748-.770722.468078-1.524811.710815-2.296845.167236-.531829.430328-1.044281.617951-1.570129.04898-.137238.125091-.21878.177429-.356811.112426-.296601.259826-.66153.53421-.856263.122772-.087097.404938-.133728.549469-.090973.100677.029755.164276.107117.2547.104584zm-20.023133 14.708466c.454407.328705.418701.810119.429566 1.216003.01123.420624.132171.839325.143829 1.263336.049072.292939.098145.585938.147217.878876.0065.237274.066131.462311.104919.693939.040009.238709.057312.478821.130616.712281.044158.263641.088317.527343.132476.790985.072815.232238.081025.480499.152588.708648.221314.705597.305908 1.454285.531037 2.158905.238647.74704.413025 1.519379.672149 2.259735.339417.969849.67157 1.945893 1.040833 2.910004.188812.492951.413452.953766.614746 1.445038.1539.37558.300171.784851.475311 1.151978.727417 1.524658 1.478455 3.047973 2.278565 4.567993.633545 1.203643 1.389343 2.352203 2.083587 3.538971.214051.365905.455872.68045.693207 1.036834.535675.804413 1.105682 1.640961 1.654144 2.458435.518525.772828 1.141663 1.493134 1.686982 2.249756.08908.123596.19226.19043.278656.315155.276428.399079.638275.783478.942443 1.176209.152924.197479.346711.334564.48584.540527.304596.451019.494568 1.292084.349396 1.816406-.251465.908387-1.128265 1.519989-1.795654 1.753907-.201386.070587-.515656.198333-.734436.132904-.344788-.103089-.564789-.410065-.766205-.663452-.260346-.327576-.563782-.5654-.815827-.892334-.465698-.604126-1.013855-1.144074-1.479583-1.753449-.975251-1.276031-1.974121-2.510406-2.840332-3.808807-2.005524-3.006104-3.669648-6.04068-4.967469-9.158356-.538726-1.294189-.972412-2.628815-1.406128-3.944702-.154449-.468537-.238983-.969818-.387603-1.4375-.203705-.641022-.29419-1.302094-.494232-1.939179-.010437-.084839-.020905-.169677-.031342-.254516-.03244-.142304-.080597-.279511-.104736-.423004-.016571-.12143-.033142-.24289-.049713-.36435-.07544-.240295-.09314-.488434-.134278-.734253-.039978-.238708-.101898-.471435-.108642-.715881-.03003-.15686-.060059-.313751-.090119-.470581-.017914-.639893-.171539-1.266998-.184631-1.911438-.003082-.152039-.051605-.313171-.055298-.465057-.014954-.616364-.075867-1.234528-.072845-1.850922.003448-.701935-.003327-1.415924.040527-2.118073.017273-.276641.065735-.537353.078155-.814605.013581-.304108.067292-.595398.107361-.90976.023773-.186371.024079-.412018.08017-.600372.056946-.191345.252655-.500672.433685-.579926.123535-.054046.361542-.107849.496369-.070892.101196.02771.163787.106995.254699.104584zm-15.300384 3.188812c.510681.374451.368896.846924.365509 1.305634-.005432.738128.069305 1.474914.087768 2.209747.01474.585815.164643 1.167633.180848 1.753998.034942.186126.069915.372314.104858.558471.008972.324921.079224.744355.176636 1.054657.009216.077484.018432.15503.027649.232514.030151.179931.067901.356933.123138.532867.012909.099457.025787.198975.038696.298432.131317.418853.171814.866973.305054 1.281799.318695.992126.572022 2.006927.920013 2.997742.754273 2.147613 1.788178 4.229309 2.888031 6.318756.359437.682861.806824 1.318268 1.170197 1.996612.154968.289246.358276.524109.529999.804199.469391.765595 1.01355 1.529297 1.523956 2.288025.706421 1.05011 1.566956 2.007386 2.317719 3.048554.263061.364837.595245.68164.850738 1.033356.227203.312805.52124.547424.764496.855682.481873.610626 1.089355 1.1922 1.600525 1.801147.295044.351502.645904.635315.931305.974854.318786.379272.719787.682526 1.033905 1.048157.079437.069641.158874.139312.238312.208953.320404.37912.767639.714997 1.098053 1.093995.141021.161743.308349.237396.450927.399536.46344.527008 1.117066.954101 1.592957 1.486236.135834.151886.31662.2547.43811.390381.0513.036652.102631.073334.153961.109986.164215.183013.420014.350616.586579.535156.055572.039703.111175.079437.166778.11914.272095.302002.691346.541047.966004.84491.072693.051941.145385.103882.218078.155823.350159.387054.905609.664032 1.261078 1.055725.159455.120361.318939.240753.478394.361114.07782.085694.245849.159729.33725.260285.242034.266296.650146.475433.91278.729492.155243.150208.398682.253662.529694.397797.115539.127105.325043.212219.427032.324432.333558.238312.667176.476685 1.000702.714966.789521.564087 1.576264 1.092834 2.340454 1.633453.361725.25589.810822.45752 1.033722.777222.125916.180603.176148.440094.242279.637329.148804.443665.210236.970398.085358 1.453644-.038025.147247-.114746.246612-.170044.400757-.088562.246917-.23587.630127-.49942.861786-.171417.150665-.350128.353759-.540009.484619-.292694.20166-.611908.094055-.969055-.054047-.114227-.075165-.228485-.15036-.342712-.225525-.547669-.235138-1.059357-.738281-1.60907-.975494-.105896-.045685-.216766-.160279-.30423-.198029-.182647-.124023-.365326-.248108-.547973-.372162-.20105-.086914-.381653-.297851-.60846-.396026-.189697-.082093-.383697-.235474-.569977-.368531-.06842-.048858-.13684-.097778-.205261-.146637-.183075-.079315-.399353-.246765-.569977-.36853-.248016-.177185-.496093-.354431-.74411-.531647-.266357-.115692-.561767-.382019-.817413-.564636-.211792-.151306-.498657-.314361-.65799-.489441-.145385-.103882-.290802-.207794-.436187-.311645-.30365-.216919-.603058-.430939-.866944-.658081-.145385-.103882-.290832-.207764-.436218-.311646-.21051-.232269-.575592-.40802-.784485-.637848-.098358-.070251-.196716-.140564-.295074-.210815-.152497-.168518-.415619-.315918-.566407-.482025-.08551-.061096-.171051-.122223-.256591-.183319-.115662-.128235-.322144-.26239-.43808-.390381-.068421-.048889-.136841-.097778-.205261-.146637-.400635-.444611-.987397-.780396-1.378449-1.21695-.122192-.100189-.244385-.200409-.366577-.300598-.505676-.568664-1.189301-1.025421-1.677307-1.585174-.132691-.152252-.282318-.220917-.412445-.37204-.451111-.524017-1.026856-.990936-1.46106-1.508118-.071625-.085266-.141357-.105072-.212646-.190582-.204682-.245575-.469086-.499237-.667328-.747589-.092285-.115601-.192322-.164459-.284149-.280365-.68689-.866852-1.494416-1.640503-2.15976-2.510193-1.178314-1.540131-2.407593-3.043091-3.339203-4.629425-.210998-.359284-.462616-.659973-.667572-1.018524-.36261-.6344-.758056-1.259064-1.098663-1.906861-.533051-1.013641-1.031952-2.035766-1.517243-3.056915-.341339-.718262-.611572-1.490845-.891937-2.223328-.230102-.601257-.449524-1.185791-.660797-1.787414-.207855-.59198-.356781-1.207764-.550903-1.805634-.197449-.608062-.27826-1.253204-.470368-1.864105-.072967-.232055-.065399-.524963-.137939-.756225-.178925-.570282-.221955-1.189972-.320099-1.776093-.418884-2.5018-.462341-5.063629-.278748-7.665436.042359-.600494.167389-1.16922.266083-1.782837.044983-.279541.136688-.634704.44632-.841674.098694-.065979.412628-.117951.527496-.087372.094238.025085.16806.10672.2547.104614z"
              fill="#3b434f"
              opacity=".2"
            />
          </svg>
        </div>
        <div className="popup__switch-mode">
          <label>
            <input
              type="checkbox"
              checked={state.dark}
              onChange={handleSwitch}
            />
            {(!state.dark && <i className="fas fa-moon"></i>) || (
              <i className="fas fa-sun"></i>
            )}
          </label>
        </div>
      </div>
      <div className="popup__main">
        <form className="form" onSubmit={handleFormSubmit}>
          <div className="form__group">
            <label htmlFor="email">Email</label>
            <div className="form__input-container">
              <input
                required
                className="form__input"
                id="email "
                type="email"
                onChange={handleInputChange("email")}
              />
            </div>
          </div>
          <div className="form__group">
            <label htmlFor="password">Secret</label>
            <div className="form__input-container">
              <input
                required
                className="form__input"
                id="password"
                type="password"
                onChange={handleInputChange("passphrase")}
              />
            </div>
          </div>
          <button className="form__button btn btn-primary" data-hover="test">
            Generate Password
          </button>
        </form>

        {state.password && (
          <div className="popup__password">{state.password}</div>
        )}
      </div>
    </div>
  );
};

render(<Popup />, window.document.querySelector("#app"));

if (module.hot) module.hot.accept();
