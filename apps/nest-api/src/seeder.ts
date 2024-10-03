import { NestFactory } from '@nestjs/core';
import { PrismaService } from './database/database.service';
import { faker } from '@faker-js/faker';
import { AppModule } from './app.module';
import { Role, TicketStatus } from '@prisma/client';

async function bootstrap() {
    console.log('Starting seeder...');

    try {
        const app = await NestFactory.createApplicationContext(AppModule);
        console.log('Application context created.');

        const prismaService = app.get(PrismaService);
        console.log('PrismaService retrieved.');

        // Test database connection
        await prismaService.$connect();
        console.log('Database connection successful.');

        for (let i = 0; i < 10; i++) {
            console.log(`Creating user ${i + 1}...`);
            const user = await prismaService.user.create({
                data: {
                    email: faker.internet.email(),
                    name: faker.person.firstName(),
                    password: faker.internet.password(),
                    image: faker.image.avatar(),
                    role: faker.helpers.arrayElement(Object.values(Role)),
                    isActiveAccount: faker.datatype.boolean(),
                    Address: {
                        create: [
                            {
                                addressLine: faker.location.streetAddress(),
                                city: faker.location.city(),
                                state: faker.location.state(),
                                postalCode: faker.location.zipCode(),
                                country: faker.location.country(),
                                isDefault: true,
                            },
                        ],
                    },
                    Preferences: {
                        create: {
                            emailNotifications: faker.datatype.boolean(),
                            productRecommendations: faker.datatype.boolean(),
                            language: faker.helpers.arrayElement(['en', 'es', 'fr']),
                            currency: faker.finance.currencyCode(),
                            timeZone: faker.location.timeZone(),
                            darkMode: faker.datatype.boolean(),
                        },
                    },
                    SupportTicket: {
                        create: [
                            {
                                subject: faker.lorem.sentence(),
                                description: faker.lorem.paragraph(),
                                status: faker.helpers.arrayElement(Object.values(TicketStatus)),
                            },
                        ],
                    },
                    ProfileImage: {
                        create: {
                            imageUrl: faker.image.avatar(),
                        },
                    },
                },
            });

            console.log(`User ${i + 1} created: ${user.email}`);
        }

        console.log('Seeding completed successfully!');
        await prismaService.$disconnect();
        await app.close();
    } catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    }
}

bootstrap();