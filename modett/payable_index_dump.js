"use strict";

function getURL(testMode) {
  if (testMode) {
    return "https://sandboxipgsdk.payable.lk/v2/payablesdk.php";
  }
  return "https://ipgsdk.payable.lk/v2/payablesdk.php";
}
class PAYable {

  constructor() {
    this.initiated = false;
    this.isProgress = false;
    this.popup = null;
    this.payment = null;
    this.sandboxMode = false
  }

  onCompleted() { }
  onDismissed() { }
  onError() { }

  startPayment(payment) {

    var inputError = {
      code: 3009,
      fields: [],
    };
    // invoice_id
    if (isEmptyValue(payment.invoice_id)) {
      inputError.fields.push({
        name: "invoice_id",
        error: "Invoice Id is a required field.",
      });
    } else {
      if (isMaxlengthValue(payment.invoice_id, 20)) {
        inputError.fields.push({
          name: "invoice_id",
          error:
            "Invoice Id length and should be less than or equal to 20.",
        });
      }
      if (isValidText(payment.invoice_id, "^[a-zA-Z0-9\\/\\.\\_\\-]*$")) {
        // ^[a-zA-Z0-9\\-]*$
        inputError.fields.push({
          name: "invoice_id",
          error: "Invalid format for Invoice Id.",
        });
      }
    }
    // order_description
    if (isEmptyValue(payment.order_description)) {
      inputError.fields.push({
        name: "order_description",
        error: "Order Description is a required field.",
      });
    } else {
      if (isMaxlengthValue(payment.order_description, 125)) {
        inputError.fields.push({
          name: "order_description",
          error:
            "Order Description should be less than 125 characters.",
        });
      }
      if (
        isValidText(
          payment.order_description,
          "^[a-zA-Z0-9\\/\\.\\,\\_\\-\\&\\(\\) ]*$"
        )
      ) {
        inputError.fields.push({
          name: "order_description",
          error: "Invalid format for Order Description.",
        });
      }
    }
    // notify_url
    if (isEmptyValue(payment.notify_url)) {
      inputError.fields.push({
        name: "notify_url",
        error: "Merchant Notification URL is a required field.",
      });
    } else {
      if (isMaxlengthValue(payment.notify_url, 300)) {
        inputError.fields.push({
          name: "notify_url",
          error:
            "Merchant Notification URL should be less than or equalto 300 characters.",
        });
      }
      if (
        isValidText(
          payment.notify_url,
          "[(https?):\\/\\/(www\\.)?a-zA-Z0-9@:%.\\-_\\+~#=]{2,256}\\.[a-z]{2,6}\\b([a-zA-Z0-9@:%_\\-+.~#?&//=]*)"
        )
      ) {
        inputError.fields.push({
          name: "notify_url",
          error: "Invalid Web URL Format for Merchant Notification URL.",
        });
      }
    }
    // return_url
    if (isEmptyValue(payment.return_url)) {
      inputError.fields.push({
        name: "return_url",
        error: "Merchant Return URL is a required field.",
      });
    } else {
      if (isMaxlengthValue(payment.return_url, 300)) {
        inputError.fields.push({
          name: "return_url",
          error:
            "Merchant Return URL should be less than or equalto 300 characters.",
        });
      }
    }
    // cancel_url
    if (isEmptyValue(payment.cancel_url)) {
      inputError.fields.push({
        name: "cancel_url",
        error: "Merchant Cancel URL is a required field.",
      });
    } else {
      if (isMaxlengthValue(payment.cancel_url, 300)) {
        inputError.fields.push({
          name: "cancel_url",
          error:
            "Merchant Cancel URL should be less than or equalto 300 characters.",
        });
      }
    }
    // check_value
    if (isEmptyValue(payment.check_value)) {
      inputError.fields.push({
        name: "check_value",
        error: "Check Value is a required field.",
      });
    } else {
      if (isMaxlengthValue(payment.check_value, 300)) {
        inputError.fields.push({
          name: "check_value",
          error:
            "Check Value should be less than or equalto 300 characters.",
        });
      }
      if (isValidText(payment.check_value, "^[a-zA-Z0-9\\.]*$")) {
        inputError.fields.push({
          name: "check_value",
          error: "Invalid format for Check Value.",
        });
      }
    }
    // custom1
    if (isMaxlengthValue(payment.custom1, 200)) {
      inputError.fields.push({
        name: "custom1",
        error: "Custom 1 cannot be more than 200 characters.",
      });
    }
    if (
      isNotEmptyValue(payment.custom1) &&
      isValidText(payment.custom1, "^[a-zA-Z0-9\\/\\.\\,\\-\\&\\(\\) ]*$")
    ) {
      inputError.fields.push({
        name: "custom1",
        error: "Invalid format for Custom 1.",
      });
    }
    // custom2
    if (isMaxlengthValue(payment.custom2, 200)) {
      inputError.fields.push({
        name: "custom2",
        error: "Custom 2 cannot be more than 200 characters.",
      });
    }
    if (
      isNotEmptyValue(payment.custom2) &&
      isValidText(payment.custom2, "^[a-zA-Z0-9\\/\\.\\,\\-\\&\\(\\) ]*$")
    ) {
      inputError.fields.push({
        name: "custom2",
        error: "Invalid format for Custom 1.",
      });
    }
    // amount
    if (isEmptyValue(payment.amount)) {
      inputError.fields.push({ name: "amount", error: "Amount is a required field." });
    } else {
      if (parseFloat(payment.amount) < 1) {
        inputError.fields.push({
          name: "amount",
          error: "Amount should be greater than 0.00.",
        });
      }
      if (isValidText(payment.amount, "^\\-?([0-9]+(?:\\.[0-9]{2}))?$")) {
        inputError.fields.push({
          name: "amount",
          error: "Invalid Amount.",
        });
      }
      if (isDecimalNumber(payment.amount)) {
        inputError.fields.push({ name: "amount", error: "Invalid Amount." });
      }
    }
    // merchant_key
    if (isEmptyValue(payment.merchant_key)) {
      inputError.fields.push({
        name: "merchant_key",
        error: "Merchant Key is a required field.",
      });
    } else {
      if (isMaxlengthValue(payment.merchant_key, 200)) {
        inputError.fields.push({
          name: "merchant_key",
          error:
            "Merchant Key cannot be less than 4 and should be less than or equal to 200.",
        });
      }
      if (isValidText(payment.merchant_key, "^[a-zA-Z0-9]*$")) {
        inputError.fields.push({
          name: "merchant_key",
          error: "Invalid format for Merchant Key.",
        });
      }
    }
    // currency_code
    if (isEmptyValue(payment.currency_code)) {
      inputError.fields.push({
        name: "currency_code",
        error: "Currency Code is a required field.",
      });
    } else {
      if (isMaxlengthValue(payment.currency_code, 3)) {
        inputError.fields.push({
          name: "currency_code",
          error: "Currency Code should be 3 characters.",
        });
      }
      if (isValidText(payment.currency_code, "^[A-Z]*$")) {
        inputError.fields.push({
          name: "currency_code",
          error: "Invalid format for Currency Code.",
        });
      }
    }
    // customer_first_name
    if (isEmptyValue(payment.customer_first_name)) {
      inputError.fields.push({
        name: "customer_first_name",
        error: "Billing Details -Contact First Name is a required field.",
      });
    } else {
      if (isMaxlengthValue(payment.customer_first_name, 50)) {
        inputError.fields.push({
          name: "customer_first_name",
          error:
            "Billing Details -Contact First Name should be less than or equal to 50.",
        });
      }
      if (isValidText(payment.customer_first_name, "^[a-zA-Z0-9\\. ]*$")) {
        inputError.fields.push({
          name: "customer_first_name",
          error: "Invalid format for Billing Details - Contact First Name.",
        });
      }
    }
    //customer_last_name
    if (isEmptyValue(payment.customer_last_name)) {
      inputError.fields.push({
        name: "customer_last_name",
        error: "Billing Details -Contact Last Name is a required field.",
      });
    } else {
      if (isMaxlengthValue(payment.customer_last_name, 50)) {
        inputError.fields.push({
          name: "customer_last_name",
          error:
            "Billing Details -Contact Last Name should be less than or equal to 50.",
        });
      }
      if (isValidText(payment.customer_last_name, "^[a-zA-Z0-9\\. ]*$")) {
        inputError.fields.push({
          name: "customer_last_name",
          error: "Invalid format for Billing Details - Contact Last Name.",
        });
      }
    }
    //customer_email
    if (isEmptyValue(payment.customer_email)) {
      inputError.fields.push({
        name: "customer_email",
        error: "Billing Email Address is a required field.",
      });
    } else {
      if (isMaxlengthValue(payment.customer_email, 100)) {
        inputError.fields.push({
          name: "customer_email",
          error:
            "Billing Email Address should be more than 5 and less than or equal to 100.",
        });
      }
      if (isValidateEmail(payment.customer_email)) {
        inputError.fields.push({
          name: "customer_email",
          error: "Invalid format for Billing Email Address.",
        });
      }
    }
    // customer_mobile_phone
    if (isEmptyValue(payment.customer_mobile_phone)) {
      inputError.fields.push({
        name: "customer_mobile_phone",
        error: "Billing Mobile Phone is a required field.",
      });
    } else {
      if (isMaxlengthValue(payment.customer_mobile_phone, 15)) {
        inputError.fields.push({
          name: "customer_mobile_phone",
          error: "Billing Details - Customer Mobile Phone number should be less than or equal to 15 characters.",
        });
      }
      if (isMinlengthValue(payment.customer_mobile_phone, 10)) {
        inputError.fields.push({
          name: "customer_mobile_phone",
          error: "Billing Details - Customer Mobile Phone cannot be less than 10 characters.",
        });
      }
      if (
        isValidText(payment.customer_mobile_phone, "^[0-9\\+ ]*$") //[0-9]{10} "(\\+94) [0-9]{2}[0-9]{7}"
      ) {
        inputError.fields.push({
          name: "customer_mobile_phone",
          error:
            "Please enter a valid Billing Details - Customer Mobile Phone number [Format : 07XXXXXXXX OR +XXxxxxxxxxx].",
        });
      }
    }
    // customer_phone
    if (isMaxlengthValue(payment.customer_phone, 15)) {
      inputError.fields.push({
        name: "customer_phone",
        error: "Billing Details - Customer Phone cannot be more than 15 characters.",
      });
    }
    if (
      isNotEmptyValue(payment.customer_phone) &&
      isMinlengthValue(payment.customer_phone, 10)
    ) {
      inputError.fields.push({
        name: "customer_phone",
        error: "Billing Details - Customer Phone cannot be less than 10 characters.",
      });
    }
    if (
      isNotEmptyValue(payment.customer_phone) &&
      isValidText(payment.customer_phone, "^[0-9\\+ ]*$")
    ) {
      inputError.fields.push({
        name: "customer_phone",
        error:
          "Please enter a valid Billing Details - Customer Phone number [Format : 07XXXXXXXX OR +XXxxxxxxxxx].",
      });
    }
    // billing_address_company
    if (isMaxlengthValue(payment.billing_address_company, 100)) {
      inputError.fields.push({
        name: "billing_address_company",
        error:
          "Billing Details - Company Name should be less than or equal to 100 characters.",
      });
    }
    if (
      isNotEmptyValue(payment.billing_address_company) &&
      isValidText(
        payment.billing_address_company,
        "^[a-zA-Z0-9\\/\\.\\,\\-\\&\\(\\) ]*$"
      )
    ) {
      inputError.fields.push({
        name: "billing_address_company",
        error: "Invalid format for Billing Details - Company Name.",
      });
    }
    // billing_address_street
    if (isEmptyValue(payment.billing_address_street)) {
      inputError.fields.push({
        name: "billing_address_street",
        error: "Billing Address - Address Line 1 is a required field.",
      });
    } else {
      if (isMaxlengthValue(payment.billing_address_street, 100)) {
        inputError.fields.push({
          name: "billing_address_street",
          error:
            "Billing Address - Address Line 1 should be less than or equal to 100 characters.",
        });
      }
      if (
        isValidText(
          payment.billing_address_street,
          "^[a-zA-Z0-9\\/\\.\\,\\-\\&\\_\\(\\) ]*$"
        )
      ) {
        inputError.fields.push({
          name: "billing_address_street",
          error: "Invalid format for Billing Address - Address Line 1.",
        });
      }
    }
    // billing_address_street2
    if (isNotEmptyValue(payment.billing_address_street2)) {
      if (isMaxlengthValue(payment.billing_address_street2, 100)) {
        inputError.fields.push({
          name: "billing_address_street2",
          error:
            "Billing Address - Address Line 2 should be less than or equal to 100 characters.",
        });
      }
      if (
        isValidText(
          payment.billing_address_street2,
          "^[a-zA-Z0-9\\/\\.\\,\\-\\&\\_\\(\\) ]*$"
        )
      ) {
        inputError.fields.push({
          name: "billing_address_street2",
          error: "Invalid format for Billing Address - Address Line 2.",
        });
      }
    }
    // billing_address_city
    if (isEmptyValue(payment.billing_address_city)) {
      inputError.fields.push({
        name: "billing_address_city",
        error: "Billing Town / City is a required field.",
      });
    } else {
      if (isMaxlengthValue(payment.billing_address_city, 100)) {
        inputError.fields.push({
          name: "billing_address_city",
          error:
            "Billing Address - Town / City should be less than or equal to 100 characters.",
        });
      }
      if (isValidText(payment.billing_address_city, "^[a-zA-Z0-9 ]*$")) {
        inputError.fields.push({
          name: "billing_address_city",
          error: "Invalid format for Billing Address - Town / City.",
        });
      }
    }
    // billing_address_postcode
    if (isEmptyValue(payment.billing_address_postcode)) {
      inputError.fields.push({
        name: "billing_address_postcode",
        error: "Billing Postcode / ZIP is a required field.",
      });
    } else {
      if (isMaxlengthValue(payment.billing_address_postcode, 10)) {
        inputError.fields.push({
          name: "billing_address_postcode",
          error:
            "Billing Address - Postal Code should be less than or equal to 10 characters.",
        });
      }
      if (isValidText(payment.billing_address_postcode, "^[a-zA-Z0-9\\-]*$")) {
        inputError.fields.push({
          name: "billing_address_postcode",
          error: "Billing Address - Postcode / ZIP is not a valid postcode / ZIP.",
        });
      }
    }
    // billing_address_province
    if (isEmptyValue(payment.billing_address_province)) {
      inputError.fields.push({
        name: "billing_address_province",
        error: "Billing Details - State / Country is a required field.",
      });
    } else {
      if (isMaxlengthValue(payment.billing_address_province, 20)) {
        inputError.fields.push({
          name: "billing_address_province",
          error:
            "Billing Details - State / Country should be less than or equal to 25 characters.",
        });
      }
      if (isValidText(payment.billing_address_province, "^[a-zA-Z0-9 ]*$")) {
        inputError.fields.push({
          name: "billing_address_province",
          error: "Invalid format for Billing Details - State / Country.",
        });
      }
    }
    // billing_address_country
    if (isEmptyValue(payment.billing_address_country)) {
      inputError.fields.push({
        name: "billing_address_country",
        error: "Billing Address - Country is mandatory.",
      });
    } else {
      if (isMaxlengthValue(payment.billing_address_country, 3)) {
        inputError.fields.push({
          name: "billing_address_country",
          error: "Billing Address - Country should be 3 characters.",
          // Invalid Billing Address - Country Length
        });
      }
      if (isValidText(payment.billing_address_country, "^[A-Z]*$")) {
        inputError.fields.push({
          name: "billing_address_country",
          error: "Invalid format for Billing Address - Country.",
        });
      }
    }
    // shipping_contact_first_name
    if (isNotEmptyValue(payment.shipping_contact_first_name)) {
      if (isMaxlengthValue(payment.shipping_contact_first_name, 50)) {
        inputError.fields.push({
          name: "shipping_contact_first_name",
          error:
            "Shipping Details - Contact First Name should be less than or equal to 50 characters.",
        });
      }
      if (
        isValidText(payment.shipping_contact_first_name, "^[a-zA-Z0-9\\. ]*$")
      ) {
        inputError.fields.push({
          name: "shipping_contact_first_name",
          error: "Invalid format for Shipping Details - Contact First Name.",
        });
      }
    }
    // shipping_contact_last_name
    if (isNotEmptyValue(payment.shipping_contact_last_name)) {
      if (isMaxlengthValue(payment.shipping_contact_last_name, 50)) {
        inputError.fields.push({
          name: "shipping_contact_last_name",
          error:
            "Shipping Details - Contact Last Name should be less than or equal to 50 characters.",
        });
      }
      if (
        isValidText(payment.shipping_contact_last_name, "^[a-zA-Z0-9\\. ]*$")
      ) {
        inputError.fields.push({
          name: "shipping_contact_last_name",
          error: "Invalid format for Shipping Details - Contact Last Name.",
        });
      }
    }
    // shipping_contact_email
    if (isNotEmptyValue(payment.shipping_contact_email)) {
      if (isMaxlengthValue(payment.shipping_contact_email, 100)) {
        inputError.fields.push({
          name: "shipping_contact_email",
          error:
            "Shipping Address - Contact Email Address should be more than 5 and less than or equal to 100 characters.",
        });
      }
      if (isValidateEmail(payment.shipping_contact_email)) {
        inputError.fields.push({
          name: "shipping_contact_email",
          error: "Invalid format for Shipping Address - Contact Email Address.",
        });
      }
    }
    // shipping_contact_mobile
    if (isNotEmptyValue(payment.shipping_contact_mobile)) {
      if (isMaxlengthValue(payment.shipping_contact_mobile, 15)) {
        inputError.fields.push({
          name: "shipping_contact_mobile",
          error:
            "Shipping Details - Customer Mobile Phone number should be less than or equal to 15 characters.",
        });
      }
      if (isMinlengthValue(payment.shipping_contact_mobile, 10)) {
        inputError.fields.push({
          name: "shipping_contact_mobile",
          error:
            "Shipping Details - Customer Mobile Phone cannot be less than 10 characters.",
        });
      }
      if (
        isValidText(payment.shipping_contact_mobile, "^[0-9\\+ ]*$") //[0-9]{10} "(\\+94) [0-9]{2}[0-9]{7}"
      ) {
        inputError.fields.push({
          name: "shipping_contact_mobile",
          error:
            "Please enter a valid Shipping Details - Customer Mobile Phone number [Format : 07XXXXXXXX OR +XXxxxxxxxxx].",
        });
      }
    }
    // shipping_contact_phone
    if (isNotEmptyValue(payment.shipping_contact_phone)) {
      if (isMaxlengthValue(payment.shipping_contact_phone, 15)) {
        inputError.fields.push({
          name: "shipping_contact_phone",
          error:
            "Shipping Details - Customer Phone cannot be more than 15 characters.",
        });
      }
      if (isMinlengthValue(payment.shipping_contact_phone, 10)) {
        inputError.fields.push({
          name: "shipping_contact_phone",
          error:
            "Shipping Details - Customer Phone cannot be less than 10 characters.",
        });
      }
      if (isValidText(payment.shipping_contact_phone, "^[0-9\\+ ]*$")) {
        inputError.fields.push({
          name: "shipping_contact_phone",
          error:
            "Please enter a valid Shipping Details - Customer Phone [Format: 07XXXXXXXX OR +XXxxxxxxxxx].",
        });
      }
    }
    // shipping_address_company
    if (isNotEmptyValue(payment.shipping_address_company)) {
      if (isMaxlengthValue(payment.shipping_address_company, 100)) {
        inputError.fields.push({
          name: "shipping_address_company",
          error:
            "Shipping Details - Company length should be less than or equal to 100 characters.",
        });
      }
      if (
        isValidText(
          payment.shipping_address_company,
          "^[a-zA-Z0-9\\/\\.\\,\\-\\&\\_\\(\\) ]*$"
        )
      ) {
        inputError.fields.push({
          name: "shipping_address_company",
          error: "Invalid format for Shipping Details - Company Name.",
        });
      }
    }
    // shipping_address_street
    if (isNotEmptyValue(payment.shipping_address_street)) {
      if (isMaxlengthValue(payment.shipping_address_street, 100)) {
        inputError.fields.push({
          name: "shipping_address_street",
          error:
            "Shipping Address - Address Line 1 should be less than or equal to 100 characters.",
        });
      }
      if (
        isValidText(
          payment.shipping_address_street,
          "^[a-zA-Z0-9\\/\\.\\,\\-\\&\\_\\(\\) ]*$"
        )//"^[a-zA-Z0-9\\/\\.\\,\\-\\&\\(\\) ]*$"
      ) {
        inputError.fields.push({
          name: "shipping_address_street",
          error: "Invalid format for Shipping Address - Address Line 1.",
        });
      }
    }
    // shipping_address_street2
    if (isNotEmptyValue(payment.shipping_address_street2)) {
      if (isMaxlengthValue(payment.shipping_address_street2, 100)) {
        inputError.fields.push({
          name: "shipping_address_street2",
          error:
            "Shipping Address - Address Line 2 length should be less than or equal to 100 characters.",
        });
      }
      if (
        isValidText(
          payment.shipping_address_street2,
          "^[a-zA-Z0-9\\/\\.\\,\\-\\&\\(\\) ]*$"
        )
      ) {
        inputError.fields.push({
          name: "shipping_address_street2",
          error: "Invalid format for Shipping Address - Address Line 2.",
        });
      }
    }
    // shipping_address_city
    if (isNotEmptyValue(payment.shipping_address_city)) {
      if (isMaxlengthValue(payment.shipping_address_city, 100)) {
        inputError.fields.push({
          name: "shipping_address_city",
          error:
            "Shipping Address - Town / City should be less than or equal to 100 characters.",
        });
      }
      if (isValidText(payment.shipping_address_city, "^[a-zA-Z0-9 ]*$")) {
        inputError.fields.push({
          name: "shipping_address_city",
          error: "Invalid format for Shipping Address - Town / City.",
        });
      }
    }
    // shipping_address_postcode
    if (isNotEmptyValue(payment.shipping_address_postcode)) {
      if (isMaxlengthValue(payment.shipping_address_postcode, 10)) {
        inputError.fields.push({
          name: "shipping_address_postcode",
          error:
            "Shipping Address - Postal Code should be less than or equal to 10 characters.",
        });
      }
      if (
        isValidText(payment.shipping_address_postcode, "^[a-zA-Z0-9\\-]*$")
      ) {
        inputError.fields.push({
          name: "shipping_address_postcode",
          error: "Shipping Address - Postcode / ZIP is not a valid postcode / ZIP.",
        });
      }
    }
    // shipping_address_province
    if (isNotEmptyValue(payment.shipping_address_province)) {
      if (isMaxlengthValue(payment.shipping_address_province, 20)) {
        inputError.fields.push({
          name: "shipping_address_province",
          error:
            "Shipping Details - State / Country should be less than or equal to 25 characters.",
        });
      }
      if (isValidText(payment.shipping_address_province, "^[a-zA-Z0-9 ]*$")) {
        inputError.fields.push({
          name: "shipping_address_province",
          error: "Invalid format for Shipping Details - State / Country.",
        });
      }
    }
    // shipping_address_country
    if (isNotEmptyValue(payment.shipping_address_country)) {
      if (isMaxlengthValue(payment.shipping_address_country, 3)) {
        inputError.fields.push({
          name: "shipping_address_country",
          error: "Shipping Address - Country should be 3 characters.",
          //Invalid Shipping Address - Country Length
        });
      }
      if (isValidText(payment.shipping_address_country, "^[A-Z]*$")) {
        inputError.fields.push({
          name: "shipping_address_country",
          error: "Invalid format for Shipping Address - Country.",
        });
      }
    }
    function isEmptyValue(value) {
      return value === undefined || value === null || value === "";
    }
    function isNotEmptyValue(value) {
      return value !== undefined && value !== null && value !== "";
    }
    function isValidateEmail(value) {
      var re =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return !re.test(String(value).toLowerCase());
    }
    function isMaxlengthValue(value, maxlength) {
      return (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        value.length > maxlength
      );
    }
    function isMinlengthValue(value, minlength) {
      return (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        value.length < minlength
      );
    }
    function isDecimalNumber(value) {
      var re = /^\d+(\.\d{1,2})?$/;
      return !re.test(value);
    }
    function isValidText(value, re) {
      if(typeof value==='string'){
        return !value.match(re);
      } else {
        return true;
      }  
    }
    // Validation End //
    if (inputError.fields.length > 0) {     
      this.onError(inputError);
      // onError(inputError)
    } else {
      this.payment = payment;
      this.isProgress = true;
      this.popup = window.open(
         getURL(this.sandboxMode),
        "popUpWindow",
        "toolbar=1,resizable=1,scrollbars=yes,height=600,width=600,left=100,top=100"
      );
      var timer = setInterval(function () {
        if (this.payable.popup.closed) {
          clearInterval(timer);
          if (this.payable.isProgress) {
            this.payable.isProgress = false;
            this.payable.onDismissed();
          }
        } else {
          this.payable.popup.postMessage({ message: { init_state: 1 } }, "*");
        }
      }, 500);
    }
  }
}

const payable = new PAYable();

window.addEventListener("beforeunload", function () {
  if (payable.popup != null && !payable.popup.closed) {
    payable.popup.close();
  }
});

window.payable = payable;

window.addEventListener("message", function (ev) {
  if (ev.data.message && ev.data.message.query === "payment") {
    payable.popup.postMessage({ message: { payment: payable.payment } }, "*");
  }
  if (ev.data.message && ev.data.message.error) {
    payable.isProgress = false;
    payable.onError({ code: 3008, error: ev.data.message.error });
  }
  if (ev.data.message && ev.data.message.completed) {
    payable.isProgress = false;
    payable.onCompleted(ev.data.message.completed);
  }
});

module.exports = payable