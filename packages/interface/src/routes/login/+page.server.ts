export const actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();

		const mail = data.get('email');
		const password = data.get('password');

		console.log(mail, password);
	},
};
