var ui = {
    safePopup: function () {
        swal("All Clear!", "We've not found any cases where you've come in contact. If you have symptoms then please use our Symptom checker.", "success")
    },
    infectedPopup: function () {
        swal("You Must Self Isolate!", "You have recently come into close contact with someone who has contracted Coronavius, and as a result you MUST self isolate for 14 days. Please follow the advice on our website: https://www.nhs.uk/conditions/coronavirus-covid-19/self-isolation-and-treatment/when-to-self-isolate-and-what-to-do/", "error")
    }
}
  