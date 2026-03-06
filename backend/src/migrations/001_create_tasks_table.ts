import { sql } from '../config/database';

export async function up() {
    // Check if type exists before creating
    const typeExists = await sql`
        SELECT EXISTS (
            SELECT 1 FROM pg_type WHERE typname = 'task_status'
        ) as exists
    `;

    if (!typeExists[0].exists) {
        await sql`
            CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled')
        `;
    }
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await sql`
        CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            task_id UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
            description TEXT DEFAULT NULL,
            status task_status NOT NULL DEFAULT 'pending',
            due_date TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
        )
    `;
}

export async function down() {
    await sql`DROP TABLE IF EXISTS tasks`;
    await sql`DROP TYPE IF EXISTS task_status`;
}