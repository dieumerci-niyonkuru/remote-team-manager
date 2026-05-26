from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('notifications', '0002_notification_enterprise'),
    ]

    operations = [
        migrations.AlterField(
            model_name='invite',
            name='email',
            field=models.EmailField(blank=True, default='', max_length=254),
        ),
    ]
