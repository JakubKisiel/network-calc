import { Formik } from "formik";
import React, { useState } from "react";
import NetworkSolver, { NetworkWithOrder } from "../logic/networks";

interface Props {}

const CalcBox = (props: Props) => {
  const [netSolv, setNetSolv] = useState<NetworkWithOrder | null>(null);
  return (
    <Formik
      initialValues={{
        ipAddress: "192.168.1.0",
        mask: "24",
        sizeOrderAsc: false,
        alphabeticalOrderAsc: false,
      }}
      onSubmit={(values, actions) => {
        const netWithOrder: NetworkWithOrder = {
          ip: values.ipAddress.split(".").map((x) => Number.parseInt(x)),
          mask: Number.parseInt(values.mask),
          sizeOrderAsc: values.sizeOrderAsc,
          alphabeticalOrderAsc: values.sizeOrderAsc,
        };
        setNetSolv(netWithOrder);
        actions.setSubmitting(false);
      }}
    ></Formik>
  );
};

export default CalcBox;
