from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('notifications', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='notification',
            name='priority',
            field=models.CharField(
                choices=[('low', 'Low'), ('normal', 'Normal'), ('high', 'High'), ('urgent', 'Urgent')],
                default='normal',
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name='notification',
            name='category',
            field=models.CharField(
                choices=[
                    ('mention', 'Mention'), ('message', 'Message'), ('task', 'Task'),
                    ('project', 'Project'), ('invite', 'Invitation'),
                    ('system', 'System'), ('reaction', 'Reaction'),
                ],
                default='system',
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='notification',
            name='deep_link',
            field=models.CharField(blank=True, default='', max_length=500),
        ),
        migrations.AddField(
            model_name='notification',
            name='description',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AlterField(
            model_name='notification',
            name='actor',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=models.deletion.CASCADE,
                related_name='notifications_sent',
                to='accounts.user',
            ),
        ),
    ]
