from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('presence', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='presence',
            name='custom_status',
            field=models.CharField(blank=True, default='', max_length=100),
        ),
        migrations.AddField(
            model_name='presence',
            name='status_emoji',
            field=models.CharField(blank=True, default='', max_length=10),
        ),
        migrations.AlterField(
            model_name='presence',
            name='status',
            field=models.CharField(
                choices=[
                    ('online', 'Online'),
                    ('away', 'Away'),
                    ('busy', 'Busy'),
                    ('dnd', 'Do Not Disturb'),
                    ('offline', 'Offline'),
                ],
                default='offline',
                max_length=20,
            ),
        ),
    ]
