declare module "express-session" {
	interface SessionData {
		passport: {
			user: {
				id: number;
				username: string;
				email: string;
				password: string;
				created_at: Date;
			};
		};
	}
}

export interface SessionsUser extends Express.AuthenticatedRequest {
	id: number;
	username: string;
	email: string;
	password: string;
	created_at: Date;
}
