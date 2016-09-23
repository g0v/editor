import React from "react";
import { shallow, mount, render } from "enzyme";
import Simple from "../javascripts/components/Simple";

describe("<Simple />", () => {
  it("renders Simple", () => {
    const wrapper = render(<Simple />);
    expect(wrapper.text()).toEqual("Simple");
  });
});
