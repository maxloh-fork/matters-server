const view = 'tag_count_view'

const materialized = 'tag_count_materialized'

exports.up = async (knex) => {
  // drop materialzied view
  await knex.raw(`drop materialized view if exists ${materialized}`)

  // drop old view
  await knex.raw(`drop view if exists ${view}`)

  // create view
  await knex.raw(`
    create view ${view} as
        select
            tag.id,
            tag.content,
            tag.cover,
            tag.description,
            tag.created_at,
            tag.updated_at,
            recent_count,
            count,
            last_used,
            coalesce(recent_count, 0) * (last_used >= now() - interval '72 hours')::int * coalesce(boost, 1) as tag_score
        from
            tag
            left join
            /* past 30 days usage */
            (
                select
                    count(id) as recent_count,
                    tag_id
                from
                    article_tag
                where
                    created_at >= now() - interval '30 days'
                group by
                    tag_id) as a1 on tag.id = a1.tag_id
            left join
            /* total usage */
            (
                select
                    count(id) as count,
                    tag_id
                from
                    article_tag
                group by
                    tag_id) as a2 on tag.id = a2.tag_id
            left join
            /* last usage */
            (
                select
                    max(created_at) as last_used,
                    tag_id
                from
                    article_tag
                group by
                    tag_id) as a3 on tag.id = a3.tag_id
            left join
            /* boost */
            (
                select
                    boost,
                    tag_id
                from
                    tag_boost) as b on tag.id = b.tag_id
  `)

  // re-create materialized view
  await knex.raw(`
    create materialized view ${materialized} as
        select *
        from ${view}
  `)
}

exports.down = async (knex) => {
  // drop materialzied view
  await knex.raw(`drop materialized view if exists ${materialized}`)

  // drop old view
  await knex.raw(`drop view if exists ${view}`)

  // create view
  await knex.raw(`
    create view ${view} as
        select
            tag.id,
            tag.content,
            tag.created_at,
            tag.updated_at,
            recent_count,
            count,
            last_used,
            coalesce(recent_count, 0) * (last_used >= now() - interval '72 hours')::int * coalesce(boost, 1) as tag_score
        from
            tag
            left join
            /* past 30 days usage */
            (
                select
                    count(id) as recent_count,
                    tag_id
                from
                    article_tag
                where
                    created_at >= now() - interval '30 days'
                group by
                    tag_id) as a1 on tag.id = a1.tag_id
            left join
            /* total usage */
            (
                select
                    count(id) as count,
                    tag_id
                from
                    article_tag
                group by
                    tag_id) as a2 on tag.id = a2.tag_id
            left join
            /* last usage */
            (
                select
                    max(created_at) as last_used,
                    tag_id
                from
                    article_tag
                group by
                    tag_id) as a3 on tag.id = a3.tag_id
            left join
            /* boost */
            (
                select
                    boost,
                    tag_id
                from
                    tag_boost) as b on tag.id = b.tag_id
  `)

  // re-create materialized view
  await knex.raw(`
    create materialized view ${materialized} as
        select *
        from ${view}
  `)
}
