import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import StatCard, {StatCardProps} from "../../dashboard/components/StatCard.tsx";

const data: StatCardProps[] = [
    {
        title: 'Bench press',
        value: '112 kg',
        interval: 'Last 3 months',
        trend: 'up',
        data: [
            80, 80, 82.5, 85, 80, 82.5, 87.5, 85, 87.5, 90, 92.5, 95, 97.5, 90, 92.5, 92.5,
            95, 95, 95, 92.5, 95, 100, 100, 100, 102.5, 102.5, 105, 107.5, 105, 105,
            105, 107.5, 110, 105, 107.5, 110, 110, 110
        ],
        dates: [
            new Date('2025-03-10'),
            new Date('2025-03-12'),
            new Date('2025-03-14'),
            new Date('2025-03-17'),
            new Date('2025-03-19'),
            new Date('2025-03-21'),
            new Date('2025-03-24'),
            new Date('2025-03-26'),
            new Date('2025-03-28'),
            new Date('2025-03-31'),
            new Date('2025-04-02'),
            new Date('2025-04-04'),
            new Date('2025-04-07'),
            new Date('2025-04-09'),
            new Date('2025-04-11'),
            new Date('2025-04-14'),
            new Date('2025-04-16'),
            new Date('2025-04-18'),
            new Date('2025-04-21'),
            new Date('2025-04-23'),
            new Date('2025-04-25'),
            new Date('2025-04-28'),
            new Date('2025-04-30'),
            new Date('2025-05-02'),
            new Date('2025-05-05'),
            new Date('2025-05-07'),
            new Date('2025-05-09'),
            new Date('2025-05-12'),
            new Date('2025-05-14'),
            new Date('2025-05-16'),
            new Date('2025-05-19'),
            new Date('2025-05-21'),
            new Date('2025-05-23'),
            new Date('2025-05-26'),
            new Date('2025-05-28'),
            new Date('2025-05-30'),
            new Date('2025-06-02'),
            new Date('2025-06-04'),
            new Date('2025-06-06'),
        ],
        trendValue: "+37%"
    },
    {
        title: 'Weight',
        value: '79 kg',
        interval: 'Last 6 months',
        trend: 'up',
        data: [
            87, 86.5, 86, 86.5, 85,
            85.3, 84.8, 84.5, 84, 83.2,
            83, 82.6, 82.3, 82.5, 82,
            81.5, 81.9, 81.6, 81.3, 81.1,
            80.1, 80.7, 81.5, 81, 80.2,
            79.2, 79
        ],
        dates: [
            new Date('2024-12-08'),
            new Date('2024-12-15'),
            new Date('2024-12-22'),
            new Date('2024-12-29'),
            new Date('2025-01-05'),
            new Date('2025-01-12'),
            new Date('2025-01-19'),
            new Date('2025-01-26'),
            new Date('2025-02-02'),
            new Date('2025-02-09'),
            new Date('2025-02-16'),
            new Date('2025-02-23'),
            new Date('2025-03-02'),
            new Date('2025-03-09'),
            new Date('2025-03-16'),
            new Date('2025-03-23'),
            new Date('2025-03-30'),
            new Date('2025-04-06'),
            new Date('2025-04-13'),
            new Date('2025-04-20'),
            new Date('2025-04-27'),
            new Date('2025-05-04'),
            new Date('2025-05-11'),
            new Date('2025-05-18'),
            new Date('2025-05-25'),
            new Date('2025-06-01'),
            new Date('2025-06-08'),
        ],
        trendValue: "-9%"
    },
];

export default function Home() {
    return (
        <>
            <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
                Home
            </Typography>
            <Grid
                container
                spacing={2}
                columns={12}
                sx={{ mb: (theme) => theme.spacing(2) }}
            >
                {data.map((card, index) => (
                    <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
                        <StatCard {...card} />
                    </Grid>
                ))}
            </Grid>
        </>
    );
}