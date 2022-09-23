import { Link } from "react-router-dom";

import React from "react";

const Public = () => {
  const content = (
    <section className='public'>
      <header>
        <h1>
          Welcome to <span className='nowrap'>Ben S. Repairs</span>
        </h1>
      </header>
      <main className='public__main'>
        <p>
          Located in beautiful Downtown Detroit, Ben S. Repairs provides a
          trained staff ready to meet your tech repair needs.
        </p>
        <address className='public__addr'>
          Ben S. Repairs
          <br />
          555 FooBar Dr
          <br />
          Detroit, MI 48032
          <br />
          <a href='tel:+15555555555'>(555) 555-555</a>
        </address>
        <br />
        <p>Owner: Ben Stoica</p>
      </main>
      <footer>
        <Link to='/login'>Employee Login</Link>
      </footer>
    </section>
  );
};

export default Public;
