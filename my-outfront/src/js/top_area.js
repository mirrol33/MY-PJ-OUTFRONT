import React, { useEffect } from "react";
import $ from "jquery";

// ** 햄버거 버튼 클릭 시 GNB 메뉴 노출 ** //
$(() =>
  $(".top-menu-btn").on("click", function () {
    $(".top-area").addClass("on");
    setTimeout(() => {
      $(".out-bg")
        .show()
        .click(function () {
          $(".top-area").removeClass("on");
          $(this).hide();
        });
    }, 300);
  })
);
