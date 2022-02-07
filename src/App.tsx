import React, { FC, useEffect, useState } from 'react';

export const App: FC = () => {
	const [value, setValue] = useState('');

	useEffect(() => {
		fetch('/assets/test.json')
			.then((res) => res.json())
			.then((test: { value: string }) => setValue(test.value));
	}, [setValue]);

	return <>{value}</>;
};
