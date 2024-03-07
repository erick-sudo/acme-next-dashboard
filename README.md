await fetch('http://localhost:4000/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        image_url,
      }),
    })
      .then((response) => response.json())
      .then((dt) => dt);

    const successState: State = {
      success: true,
      message: 'Customer created successfully.',
    };