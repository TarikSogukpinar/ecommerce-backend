import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

const FeatureList = [
  {
    title: "Simple Usage",
    Svg: require("@site/static/img/icon1.svg").default,
    description: (
      <>
        Mock API provides a fast and secure API for your e-commerce
        applications. You can see the results in seconds.
      </>
    ),
  },
  {
    title: "E-commerce API diversity",
    Svg: require("@site/static/img/icon2.svg").default,
    description: (
      <>API options created for many scenarios for your e-commerce project</>
    ),
  },
  {
    title: "Powered by  Go & Nest.js and CockroachDB",
    Svg: require("@site/static/img/icon3.svg").default,
    description: (
      <>
        This application is built with Go, Node and Cockroach Database.
      </>
    ),
  },
];

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
