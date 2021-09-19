import Vue from "vue/dist/vue.js";
import { message } from "../../server/socketTypes";
import msgManager from "./message";

let app = new Vue({
  el: "#app",
  data: {
    city: "Humboldt",
    province: "SK",
    street: "1th Street",
    streets: {},
    isLoading: false,
    ruleType: "range",
    dnc: undefined,
    rangeStart: undefined,
    rangeEnd: undefined,
    filtered: undefined,
    printMode: false,
    title: "Territory",
    subTitle: "Locality: Humboldt - Number: X ",
    sideOfStreet: "even",
    showInstructions: false,
    nsw: "",
    mm: undefined,
    publicId: "Not Connected",
    useCached: true,
  },
  methods: {
    get: function () {
      if (!this.isLoading) {
        for (let street in this.streets) {
          if (this.streets[street].state != "resolved") {
            this.mm.sendMessage(
              `Do we have: ${street}, ${this.city}, ${this.province}`,
              JSON.stringify({
                street,
                city: this.city,
                province: this.province,
                useCache: this.useCached,
              })
            );
            setTimeout(() => {
              if (this.streets[street].state !== "resolved") {
                this.streets[street].state = "timeout";
                console.log("timeout of " + street);
                this.setIsLoading();
              }
            }, 45000);
            this.streets[street].state = "pending";
          }
        }
        this.setIsLoading();
      }
    },
    addStreet: function () {
      this.streets[this.street] = {
        state: "not checked",
        street: this.street,
        rules: [],
      };
      this.$forceUpdate();
      this.setIsLoading();
    },
    write: function (street, local, data) {
      console.log(street, data);
      if (this.streets[street] && local === `${this.city}-${this.province}`) {
        if (data === "failed") {
          this.streets[street].state = "failed";
        } else {
          (this.streets[street].data = data),
            (this.streets[street].state = "resolved");
        }
        this.setIsLoading();
      } else {
        console.log("Street Not Applicable");
      }
    },
    setIsLoading: function () {
      let output = false;
      console.log("checking...");
      for (let x in this.streets) {
        if (this.streets[x].state == "pending") {
          output = true;
          break;
        }
      }
      this.filter();
      this.isLoading = output;
    },
    addRule: function (where) {
      let rule: any = { ruleType: this.ruleType };
      if (this.ruleType == "dnc") {
        rule.dnc = parseInt(this.dnc);
      } else if (this.ruleType === "nsw") {
        rule.nsw = parseInt(this.nsw);
      } else if (this.ruleType == "range") {
        (rule.start = parseInt(this.rangeStart)),
          (rule.end = parseInt(this.rangeEnd));
      } else if (this.ruleType == "Even/Odd") {
        rule.evenOdd = this.sideOfStreet;
      }
      this.streets[where].rules.push(rule);
      this.$forceUpdate();
    },
    filter: function () {
      function getHouseNumber(full) {
        return parseInt(full.split(" ")[0]);
      }
      console.log("filtering");
      let out = [];
      for (let streetId in this.streets) {
        const street = this.streets[streetId];
        if (street.rules.length == 0) {
          continue;
        }
        let houseNumbers = [];
        for (let ruleId in street.rules) {
          let rule = street.rules[ruleId];
          if (rule.ruleType == "all") {
            for (let i in street.data) {
              houseNumbers.push(getHouseNumber(street.data[i].address));
            }
          }
        }
        function getPhoneNumber(hn) {
          let r = undefined;
          street.data.forEach((element) => {
            if (getHouseNumber(element.address) == hn) {
              r = element.phone.replace(/\D/g, "");
            }
          });
          return r;
        }
        for (let ruleId in street.rules) {
          let rule = street.rules[ruleId];
          if (rule.ruleType == "range") {
            while (houseNumbers.length > 0) {
              houseNumbers.pop();
            }
            for (let i in street.data) {
              let houseNumber = getHouseNumber(street.data[i].address);
              if (rule.start <= houseNumber && houseNumber < rule.end) {
                houseNumbers.push(houseNumber);
              }
            }
          }
        }
        for (let ruleId in street.rules) {
          let rule = street.rules[ruleId];
          if (rule.ruleType == "dnc") {
            let output = [];
            for (let i in houseNumbers) {
              if (houseNumbers[i] != rule.dnc) {
                output.push(houseNumbers[i]);
              }
            }
            houseNumbers = output;
          }
        }
        for (let ruleId in street.rules) {
          let rule = street.rules[ruleId];
          if (rule.ruleType == "Even/Odd") {
            let output = [];
            for (let i in houseNumbers) {
              if (
                (houseNumbers[i] % 2 == 0 && rule.evenOdd == "even") ||
                (houseNumbers[i] % 2 == 1 && rule.evenOdd == "odd")
              ) {
                console.log("isTrue");
                output.push(houseNumbers[i]);
              }
            }
            houseNumbers = output;
          }
        }
        for (let ruleId in street.rules) {
          let rule = street.rules[ruleId];
          if (rule.ruleType == "nsw") {
            let output = [];
            for (let i in houseNumbers) {
              try {
                console.log(houseNumbers[i]);
                const pn = getPhoneNumber(houseNumbers[i]);
                console.log(pn);
                if (pn.startsWith(rule.nsw)) {
                  output.push(houseNumbers[i]);
                }
              } catch (e) {}
            }
            houseNumbers = output;
          }
        }
        console.log(houseNumbers);
        for (let i in street.data) {
          let houseNumber = getHouseNumber(street.data[i].address);
          if (houseNumbers.includes(houseNumber)) {
            out.push(street.data[i]);
          }
        }
      }
      console.log(out);
      this.filtered = out;
      return out;
    },
    print: function () {
      this.printMode = true;
      setTimeout(() => {
        window.print();
        setTimeout(() => {
          this.printMode = false;
        }, 1000);
      }, 10);
    },
    onMessage: function (newMessage: message) {
      console.log(newMessage.message, newMessage.data);
      if (newMessage.senderType === "finder-server") {
        let data = JSON.parse(newMessage.data);
        this.write(data.street, data.local, data.data);
      }
      if (newMessage.senderType === "open-tab") {
        window.open(newMessage.data);
      }
    },
  },
  created: function () {
    console.log("created!");
    this.mm = new msgManager({
      defaultSenderType: "finder-ui",
      onMessage: this.onMessage,
      onAuth: (uuid, color, publicId) => {
        this.publicId = publicId;
      },
      doNotTriggerOnMessageOnLoad: true,
    });
  },
});
